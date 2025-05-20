u(document).on("click", "#editPost2", async (e) => {
    const target = u(e.target)
    const post = target.closest(".post")
    const content = post.find(".post_content")
    const edit_place_l = post.find('.post_edit')
    const edit_place = u(edit_place_l.first())
    const id = post.attr('data-id').split('_')

    let type = 'post'
    if(post.hasClass('comment')) {
        type = 'comment'
    }



    if(edit_place.html() == '') {
        target.addClass('lagged')
        const params = {}
        if(type == 'post') {
            params['posts'] = post.attr('data-id')
        } else {
            params['owner_id'] = 1
            params['comment_id'] = id[1]
        }

        const api_req = await window.OVKAPI.call(`wall.${type == 'post' ? 'getById' : 'getComment'}`, params)
        const api_post = api_req.items[0]
        
        edit_place.html(`
            <div class='edit_menu'>
                <form id="write">
                    <textarea placeholder="${tr('edit')}" name="text" style="width: 100%;resize: none;" class="expanded-textarea small-textarea">${api_post.text}</textarea>
                    
                    <div class='post-buttons'>
                        <div class="post-horizontal"></div>
                        <div class="post-vertical"></div>
                        <div class="post-repost"></div>
                        <div class="post-source"></div>

                        <div class='post-opts'>
                            ${type == 'post' ? `<label>
                                <input type="checkbox" name="nsfw" ${api_post.is_explicit ? 'checked' : ''} /> ${tr('contains_nsfw')}
                            </label>` : ''}

                            ${api_post.owner_id < 0 && api_post.can_pin ? `<label>
                                <input type="checkbox" name="as_group" ${api_post.from_id < 0 ? 'checked' : ''} /> ${tr('post_as_group')}
                            </label>` : ''}
                        </div>

                        <input type="hidden" id="source" name="source" value="none" />
                        <div class="page_add_media">
                            <a id="__photoAttachment">
                                <img src="/assets/packages/static/openvk/img/oxygen-icons/16x16/mimetypes/application-x-egon.png" />
                                ${tr('photo')}
                            </a>
                            <a id="__videoAttachment">
                                <img src="/assets/packages/static/openvk/img/oxygen-icons/16x16/mimetypes/application-vnd.rn-realmedia.png" />
                                ${tr('video')}
                            </a>
                            <a id="__audioAttachment">
                                <img src="/assets/packages/static/openvk/img/oxygen-icons/16x16/mimetypes/audio-ac3.png" />
                                ${tr('audio')}
                            </a>
                            <a class="post-attach-menu__trigger" id="moreAttachTrigger">
                                ${tr('show_more')}
                            </a>
                            <div class="tippy-menu" id="moreAttachTooltip2" style="display: none">
                                    ${type == 'post' ? `<a id="__documentAttachment">
                                        <img src="/assets/packages/static/openvk/img/oxygen-icons/16x16/mimetypes/application-octet-stream.png" />
                                        ${tr('document')}
                                    </a>
                                    <a id="__notesAttachment">
                                        <img src="/assets/packages/static/openvk/img/oxygen-icons/16x16/mimetypes/application-x-srt.png" />
                                        ${tr('note')}
                                    </a>
                                    <a id='__sourceAttacher'>
                                        <img src="/assets/packages/static/openvk/img/oxygen-icons/16x16/actions/insert-link.png" />
                                        ${tr('source')}
                                    </a>` : ''}
                            </div>
                        </div>
                        <div class='edit_menu_buttons'>
                            <input class='button' type='button' id='__edit_save' value='${tr('save')}'>
                            <input class='button' type='button' id='__edit_cancel' value='${tr('cancel')}'>
                        </div>
                    </div>
                </form>
            </div>`)

        if(api_post.copyright) {
            edit_place.find('.post-source').html(`
                <span>${tr('source')}: <a>${escapeHtml(api_post.copyright.link)}</a></span>
                <div id='remove_source_button'></div>
            `)

            edit_place.find('.post-source #remove_source_button').on('click', (e) => {
                edit_place.find('.post-source').html('')
                edit_place.find(`input[name='source']`).attr('value', 'remove')
            })
        }

        if(api_post.copy_history && api_post.copy_history.length > 0) {
            edit_place.find('.post-repost').html(`
                <span>${tr('has_repost')}.</span>
            `)
        }

        // horizontal attachments
        api_post.attachments.forEach(att => {
            const type = att.type
            let aid = att[type].owner_id + '_' + att[type].id
            if(att[type] && att[type].access_key) {
                aid += "_" + att[type].access_key
            }

            if(type == 'video' || type == 'photo') {
                let preview = ''

                if(type == 'photo') {
                    preview = att[type].sizes[1].url
                } else {
                    preview = att[type].image[0].url
                }

                __appendToTextarea({
                    'type': type,
                    'preview': preview,
                    'id': aid
                }, edit_place)
            } else if(type == 'poll') {
                __appendToTextarea({
                    'type': type,
                    'alignment': 'vertical',
                    'html': tr('poll'),
                    'id': att[type].id,
                    'undeletable': true,
                }, edit_place) 
            } else {
                const found_block = post.find(`div[data-att_type='${type}'][data-att_id='${aid}']`)
                __appendToTextarea({
                    'type': type,
                    'alignment': 'vertical',
                    'html': found_block.html(),
                    'id': aid,
                }, edit_place)
            }
        })

        target.removeClass('lagged')

        edit_place.find('.edit_menu #__edit_save').on('click', async (ev) => {
            const text_node = edit_place.find('.edit_menu textarea')
            const nsfw_mark = edit_place.find(`.edit_menu input[name='nsfw']`)
            const as_group = edit_place.find(`.edit_menu input[name='as_group']`)
            const copyright = edit_place.find(`.edit_menu input[name='source']`)
            const collected_attachments = collect_attachments(edit_place.find('.post-buttons')).join(',')
            const params = {}
            
            params['owner_id'] = id[0]
            params['post_id'] = id[1]
            params['message'] = text_node.nodes[0].value

            if(nsfw_mark.length > 0) {
                params['explicit'] = Number(nsfw_mark.nodes[0].checked)
            }
            
            params['attachments'] = collected_attachments
            if(collected_attachments.length < 1) {
                params['attachments'] = 'remove'
            }

            if(as_group.length > 0 && as_group.nodes[0].checked) {
                params['from_group'] = 1
            }

            if(copyright.nodes[0].value != 'none') {
                params['copyright'] = copyright.nodes[0].value
            }

            u(ev.target).addClass('lagged')
            // больше двух запросов !
            try {
                if(type == 'post') {
                    await window.OVKAPI.call('wall.edit', params)
                } else {
                    params['comment_id'] = id[1]
                    await window.OVKAPI.call('wall.editComment', params)
                }
            } catch(e) {
                fastError(e.message)
                u(ev.target).removeClass('lagged')
                return
            }
            
            const new_post_html = await (await fetch(`/iapi/getPostTemplate/${id[0]}_${id[1]}?type=${type}`, {
                'method': 'POST'
            })).text()
            u(ev.target).removeClass('lagged')
            post.removeClass('editing')
            post.nodes[0].outerHTML = u(new_post_html).last().outerHTML

            bsdnHydrate()
        })
    
        edit_place.find('.edit_menu #__edit_cancel').on('click', (e) => {
            post.removeClass('editing')
        })

        tippy(edit_place.find('#moreAttachTrigger').nodes[0], {
            content: edit_place.find('#moreAttachTooltip2').nodes[0],
            allowHTML: true,
            interactive: true,
            trigger: 'mouseenter',
            placement: 'bottom',
            theme: 'light vk',
            onShown: () => {
                const tooltip = document.getElementById('moreAttachTooltip2');
                if (tooltip) tooltip.style.display = 'block';
            }
        });
    }

    post.addClass('editing')
})
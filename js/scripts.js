
window.mr = window.mr || {};

mr = (function (mr, $, window, document){
    "use strict";

    mr = mr || {};

    var components = {documentReady: [],documentReadyDeferred: [], windowLoad: [], windowLoadDeferred: []};

    mr.status = {documentReadyRan: false, windowLoadPending: false};

    $(document).ready(documentReady);
    $(window).on("load", windowLoad);

    function documentReady(context){
        
        context = typeof context === typeof undefined ? $ : context;
        components.documentReady.concat(components.documentReadyDeferred).forEach(function(component){
            component(context);
        });
        mr.status.documentReadyRan = true;
        if(mr.status.windowLoadPending){
            windowLoad(mr.setContext());
        }
    }

    function windowLoad(context){
        if(mr.status.documentReadyRan){
            mr.status.windowLoadPending = false;
            context = typeof context === "object" ? $ : context;
            components.windowLoad.concat(components.windowLoadDeferred).forEach(function(component){
               component(context);
            });
        }else{
            mr.status.windowLoadPending = true;
        }
    }

    mr.setContext = function (contextSelector){
        var context = $;
        if(typeof contextSelector !== typeof undefined){
            return function(selector){
                return $(contextSelector).find(selector);
            };
        }
        return context;
    };

    mr.components    = components;
    mr.documentReady = documentReady;
    mr.windowLoad    = windowLoad;

    return mr;
}(window.mr, jQuery, window, document));

//////////////// Utility Functions
mr = (function (mr, $, window, document){
    "use strict";
    mr.util = {};

    mr.util.requestAnimationFrame    = window.requestAnimationFrame || 
                                       window.mozRequestAnimationFrame || 
                                       window.webkitRequestAnimationFrame ||
                                       window.msRequestAnimationFrame;

    mr.util.documentReady = function($){
        var today = new Date();
        var year = today.getFullYear();
        $('.update-year').text(year);
    };

    mr.util.windowLoad = function($){
        $('[data-delay-src]').each(function(){
            var $el = $(this);
            $el.attr('src', $el.attr('data-delay-src'));
            $el.removeAttr('data-delay-src');
        });
    };

    mr.util.getURLParameter = function(name) {
        return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [undefined, ""])[1].replace(/\+/g, '%20')) || null;
    };


    mr.util.capitaliseFirstLetter = function(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    mr.util.slugify = function(text, spacesOnly){
        if(typeof spacesOnly !== typeof undefined){
            return text.replace(/ +/g, '');
        }else{
            return text
                .toLowerCase()
                .replace(/[\~\!\@\#\$\%\^\&\*\(\)\-\_\=\+\]\[\}\{\'\"\;\\\:\?\/\>\<\.\,]+/g, '')
                .replace(/ +/g, '-');
        }
    };

    mr.util.sortChildrenByText = function(parentElement, reverse){
        var $parentElement = $(parentElement);
        var items          = $parentElement.children().get();
        var order          = -1;
        var order2         = 1;
        if(typeof reverse !== typeof undefined){order = 1; order2 = -1;}

        items.sort(function(a,b){
          var keyA = $(a).text();
          var keyB = $(b).text();

          if (keyA < keyB) return order;
          if (keyA > keyB) return order2;
          return 0;
        });
        
        // Append back into place
        $parentElement.empty();
        $(items).each(function(i, itm){
          $parentElement.append(itm);
        });
    };
    
    // Set data-src attribute of element from src to be restored later
    mr.util.idleSrc = function(context, selector){
        
            selector  = (typeof selector !== typeof undefined) ? selector : '';
            var elems = context.is(selector+'[src]') ? context : context.find(selector+'[src]');

        elems.each(function(index, elem){
            elem           = $(elem);
            var currentSrc = elem.attr('src'),
                dataSrc    = elem.attr('data-src');

            // If there is no data-src, save current source to it
            if(typeof dataSrc === typeof undefined){
                elem.attr('data-src', currentSrc);
            }

            // Clear the src attribute
            elem.attr('src', '');    
            
        });
    };

    // Set src attribute of element from its data-src where it was temporarily stored earlier
    mr.util.activateIdleSrc = function(context, selector){
        
        selector     = (typeof selector !== typeof undefined) ? selector : '';
        var elems    = context.is(selector+'[data-src]') ? context : context.find(selector+'[data-src]');

        elems.each(function(index, elem){
            elem = $(elem);
            var dataSrc    = elem.attr('data-src');

            // Write the 'src' attribute using the 'data-src' value
            elem.attr('src', dataSrc);
        });
    };

    mr.util.pauseVideo = function(context){
        var elems = context.is('video') ? context : context.find('video');

        elems.each(function(index, video){
            var playingVideo = $(video).get(0);
            playingVideo.pause();
        });
    };

    // Take a text value in either px (eg. 150px) or vh (eg. 65vh) and return a number in pixels.
    mr.util.parsePixels = function(text){
        var windowHeight = $(window).height(), value;
        
        // Text text against regular expression for px value.
        if(/^[1-9]{1}[0-9]*[p][x]$/.test(text)){
            return parseInt(text.replace('px', ''),10);
        }
        // Otherwise it is vh value.
        else if(/^[1-9]{1}[0-9]*[v][h]$/.test(text)){
            value = parseInt(text.replace('vh', ''),10);
            // Return conversion to percentage of window height.
            return windowHeight * (value/100);
        }else{
            // If it is not proper text, return -1 to indicate bad value.
            return -1;
        }
    };

    mr.util.removeHash = function() { 
        // Removes hash from URL bar without reloading and without losing search query
        history.pushState("", document.title, window.location.pathname + window.location.search);
    }

    mr.components.documentReady.push(mr.util.documentReady);
    mr.components.windowLoad.push(mr.util.windowLoad);
    return mr;

}(mr, jQuery, window, document));

//////////////// Window Functions
mr = (function (mr, $, window, document){
    "use strict";

    mr.window = {};
    mr.window.height = $(window).height();
    mr.window.width = $(window).width();

    $(window).on('resize',function(){
        mr.window.height = $(window).height();
        mr.window.width = $(window).width();
    });

    return mr;
}(mr, jQuery, window, document));

//////////////// Scroll Functions
mr = (function (mr, $, window, document){
    "use strict";

    
    mr.scroll           = {};
    var raf             = window.requestAnimationFrame || 
                          window.mozRequestAnimationFrame || 
                          window.webkitRequestAnimationFrame ||
                          window.msRequestAnimationFrame;
    mr.scroll.listeners = [];
    mr.scroll.busy      = false;
    mr.scroll.y         = 0;
    mr.scroll.x         = 0;
    
    var documentReady = function($){

        //////////////// Capture Scroll Event and fire scroll function
        jQuery(window).off('scroll.mr');    
        jQuery(window).on('scroll.mr', function(evt) {
                if(mr.scroll.busy === false){
                    
                    mr.scroll.busy = true;
                    raf(function(evt){  
                        mr.scroll.update(evt);
                    });
                    
                }
                if(evt.stopPropagation){
                    evt.stopPropagation();
                }
        });
        
    };

    mr.scroll.update = function(event){
        
        // Loop through all mr scroll listeners
        var parallax = typeof window.mr_parallax !== typeof undefined ? true : false;
        mr.scroll.y = (parallax ? mr_parallax.mr_getScrollPosition() : window.pageYOffset);
        mr.scroll.busy = false;
        if(parallax){
            mr_parallax.mr_parallaxBackground();
        }


        if(mr.scroll.listeners.length > 0){
            for (var i = 0, l = mr.scroll.listeners.length; i < l; i++) {
               mr.scroll.listeners[i](event);
            }
        }
        
    };

    mr.scroll.documentReady = documentReady;

    mr.components.documentReady.push(documentReady);

    return mr;

}(mr, jQuery, window, document));

//////////////// Dropdowns
mr = (function (mr, $, window, document){
    "use strict";
    
    mr.dropdowns = mr.dropdowns || {};

    mr.dropdowns.done = false;
    
    mr.dropdowns.documentReady = function($){

        var rtl = false;

        if($('html[dir="rtl"]').length){
            rtl = true;
        }

        if(!mr.dropdowns.done){
            jQuery(document).on('click','body:not(.dropdowns--hover) .dropdown, body.dropdowns--hover .dropdown.dropdown--click',function(event){
                var dropdown = jQuery(this);
                if(jQuery(event.target).is('.dropdown--active > .dropdown__trigger')){
                    dropdown.siblings().removeClass('dropdown--active').find('.dropdown').removeClass('dropdown--active');
                    dropdown.toggleClass('dropdown--active');
                }else{
                    $('.dropdown--active').removeClass('dropdown--active');
                    dropdown.addClass('dropdown--active');
                }
            });
            jQuery(document).on('click touchstart', 'body:not(.dropdowns--hover)', function(event){
                if(!jQuery(event.target).is('[class*="dropdown"], [class*="dropdown"] *')){
                    $('.dropdown--active').removeClass('dropdown--active');
                }
            });
            jQuery('body.dropdowns--hover .dropdown').on('click', function(event){
                event.stopPropagation();
                var hoverDropdown = jQuery(this);
                hoverDropdown.toggleClass('dropdown--active');
            });

            // Append a container to the body for measuring purposes
            jQuery('body').append('<div class="container containerMeasure" style="opacity:0;pointer-events:none;"></div>');

            
        

            // Menu dropdown positioning
            if(rtl === false){
                mr.dropdowns.repositionDropdowns($);
                jQuery(window).on('resize', function(){mr.dropdowns.repositionDropdowns($);});
            }else{
                mr.dropdowns.repositionDropdownsRtl($);
                jQuery(window).on('resize', function(){mr.dropdowns.repositionDropdownsRtl($);});
            }

            mr.dropdowns.done = true;
        }
    };

    mr.dropdowns.repositionDropdowns = function($){
        $('.dropdown__container').each(function(){
            var container, containerOffset, masterOffset, menuItem, content;

                jQuery(this).css('left', '');

                container       = jQuery(this);  
                containerOffset = container.offset().left;
                masterOffset    = jQuery('.containerMeasure').offset().left;
                menuItem        = container.closest('.dropdown').offset().left;
                content         = null;
                
                container.css('left',((-containerOffset)+(masterOffset)));

                if(container.find('.dropdown__content:not([class*="lg-12"])').length){
                    content = container.find('.dropdown__content');
                    content.css('left', ((menuItem)-(masterOffset)));
                }
                
        });
        $('.dropdown__content').each(function(){
            var dropdown, offset, width, offsetRight, winWidth, leftCorrect;

                dropdown    = jQuery(this);
                offset      = dropdown.offset().left;
                width       = dropdown.outerWidth(true);
                offsetRight = offset + width;
                winWidth    = jQuery(window).outerWidth(true);
                leftCorrect = jQuery('.containerMeasure').outerWidth() - width;

            if(offsetRight > winWidth){
                dropdown.css('left', leftCorrect);
            }

        });
    };

    mr.dropdowns.repositionDropdownsRtl = function($){

        var windowWidth = jQuery(window).width();

        $('.dropdown__container').each(function(){
            var container, containerOffset, masterOffset, menuItem, content;
 
                jQuery(this).css('left', '');

                container   = jQuery(this);
                containerOffset = windowWidth - (container.offset().left + container.outerWidth(true));
                masterOffset    = jQuery('.containerMeasure').offset().left;
                menuItem        = windowWidth - (container.closest('.dropdown').offset().left + container.closest('.dropdown').outerWidth(true));
                content         = null;
                
                container.css('right',((-containerOffset)+(masterOffset)));

                if(container.find('.dropdown__content:not([class*="lg-12"])').length){
                    content = container.find('.dropdown__content');
                    content.css('right', ((menuItem)-(masterOffset)));
                }
        });
        $('.dropdown__content').each(function(){
            var dropdown, offset, width, offsetRight, winWidth, rightCorrect;

                dropdown    = jQuery(this);
                offset      = windowWidth - (dropdown.offset().left + dropdown.outerWidth(true));
                width       = dropdown.outerWidth(true);
                offsetRight = offset + width;
                winWidth    = jQuery(window).outerWidth(true);
                rightCorrect = jQuery('.containerMeasure').outerWidth() - width;

            if(offsetRight > winWidth){
               dropdown.css('right', rightCorrect);
            }

        });
    };
    

    mr.components.documentReady.push(mr.dropdowns.documentReady);
    return mr;

}(mr, jQuery, window, document));

//////////////// Masonry
mr = (function (mr, $, window, document){
    "use strict";
    
    mr.masonry = mr.masonry || {};

    mr.masonry.documentReady = function($){

        mr.masonry.updateFilters();

        $(document).on('click touchstart', '.masonry__filters li:not(.js-no-action)', function(){
            var masonryFilter = $(this);
            var masonryContainer = masonryFilter.closest('.masonry').find('.masonry__container');
            var filterValue = '*';
            if(masonryFilter.attr('data-masonry-filter') !== '*'){
                filterValue = '.filter-'+masonryFilter.attr('data-masonry-filter');
            }
            masonryFilter.siblings('li').removeClass('active');
            masonryFilter.addClass('active');
            masonryContainer.removeClass('masonry--animate');
            masonryContainer.on('layoutComplete',function(){
                $(this).addClass('masonry--active');
                if(typeof mr_parallax !== typeof undefined){
                    setTimeout(function(){ mr_parallax.profileParallaxElements(); },100);
                }
            });
            masonryContainer.isotope({ filter: filterValue });
            
        });
        
    };

    mr.masonry.windowLoad = function(){

        $('.masonry').each(function(){
            var masonry       = $(this).find('.masonry__container'),
                masonryParent = $(this),
                defaultFilter = '*',
                themeDefaults, ao = {};

            themeDefaults = {
                percentPosition: true,
                itemSelector: '.masonry__item',
                filter: '*',
                masonry: {
                  columnWidth: '.masonry__item'
                },
                transitionDuration: 0
            };

            // Check for a default filter attribute
            if(masonryParent.is('[data-default-filter]')){
                defaultFilter = masonryParent.attr('data-default-filter').toLowerCase();
                defaultFilter = '.filter-'+defaultFilter;
                masonryParent.find('li[data-masonry-filter]').removeClass('active');
                masonryParent.find('li[data-masonry-filter="'+masonryParent.attr("data-default-filter").toLowerCase()+'"]').addClass('active');
            }

            // Use data attributes to override the default settings and provide a per-masonry customisation where necessary.
            ao.filter = defaultFilter !== '*' ? defaultFilter : undefined;

            masonry.on('layoutComplete',function(){
                masonry.addClass('masonry--active');
                if(typeof mr_parallax !== typeof undefined){
                    setTimeout(function(){ mr_parallax.profileParallaxElements(); },100);
                }
            });

            
            masonry.isotope(jQuery.extend({}, themeDefaults, mr.masonry.options, ao));

        });
    };

    mr.masonry.updateFilters = function(masonry){

        // If no argument is supplied, just apply the update to all masonry sets on the page.
        masonry = typeof masonry !== typeof undefined ? masonry : '.masonry';
        
        var $masonry = $(masonry);
        
        $masonry.each(function(){
            var $masonry         = $(this),
                masonryContainer = $masonry.find('.masonry__container'),
                filters          = $masonry.find('.masonry__filters'),
                // data-filter-all-text can be used to set the word for "all"
                filterAllText    = typeof filters.attr('data-filter-all-text') !== typeof undefined ? filters.attr('data-filter-all-text') : "All",
                filtersList;
            
            // Ensure we are working with a .masonry element
            if($masonry.is('.masonry')){
                // If a filterable masonry item exists
                if(masonryContainer.find('.masonry__item[data-masonry-filter]').length){
                    
                    // Create empty ul for filters
                    filtersList = filters.find('> ul');

                    if(!filtersList.length){
                        filtersList = filters.append('<ul></ul>').find('> ul');
                    }

                    // To avoid cases where user leave filter attribute blank
                    // only take items that have filter attribute
                    masonryContainer.find('.masonry__item[data-masonry-filter]').each(function(){
                        var masonryItem  = $(this),
                            filterString = masonryItem.attr('data-masonry-filter'),
                            filtersArray = [];

                        // If not undefined or empty
                        if(typeof filterString !== typeof undefined && filterString !== ""){
                            // Split tags from string into array 
                            filtersArray = filterString.split(',');
                        }
                        $(filtersArray).each(function(index, tag){

                            // Slugify the tag

                            var slug = mr.util.slugify(tag);

                            // Add the filter class to the masonry item

                            masonryItem.addClass('filter-'+slug);

                            // If this tag does not appear in the list already, add it
                            if(!filtersList.find('[data-masonry-filter="'+slug+'"]').length){
                                filtersList.append('<li data-masonry-filter="'+slug+'">'+tag+'</li>');
                                
                            }
                        }); 
                    });
                    
                    // Remove any unnused filter options in list
                    filtersList.find('[data-masonry-filter]').each(function(){
                        var $this  = $(this),
                            filter = $this.text();
                        
                        if($(this).attr('data-masonry-filter') !== "*"){
                            if(!$masonry.find('.masonry__item[data-masonry-filter*="'+filter+'"]').length){
                                $this.remove();
                            }
                        }
                    });

                    mr.util.sortChildrenByText($(this).find('.masonry__filters ul'));
                    // Add a filter "all" option
                    if(!filtersList.find('[data-masonry-filter="*"]').length){
                        filtersList.prepend('<li class="active" data-masonry-filter="*">'+filterAllText+'</li>');
                    }

                }
                //End of "if filterable masonry item exists"
            }
            //End of "if $masonry is .masonry"
        });

    };

    mr.masonry.updateLayout = function(masonry){
        
        // If no argument is supplied, just apply the update to all masonry sets on the page.
        masonry = typeof masonry !== typeof undefined ? masonry : '.masonry';

        var $masonry = $(masonry);
        

        $masonry.each(function(){
            var collection       = $(this),
                newItems         = collection.find('.masonry__item:not([style])'),
                masonryContainer = collection.find('.masonry__container');

            if(collection.is('.masonry')){
                if(newItems.length){
                    masonryContainer.isotope('appended', newItems).isotope( 'layout');
                }
                
                masonryContainer.isotope('layout');
            }
        });
    };

    mr.components.documentReady.push(mr.masonry.documentReady);
    mr.components.windowLoad.push(mr.masonry.windowLoad);
    return mr;

}(mr, jQuery, window, document));

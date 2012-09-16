(function ($) {

  /** jQuery plugin for resorting regions **/
  $.fn.sortRegion = function() {
    // This just needs to scan the region and send data back to Drupal.
  }
  
  Drupal.behaviors.draggableBlocks = {
    attach: function (context, settings) {

      $('.draggable-block', context).each(function () {
        $(this).draggable({
          revert: "invalid",
          containment: "document",
          connectToSortable : '.region',
          helper : 'clone',
          stop: function(event, ui) {
            // ui.helper.hide();
          }
        });
        
        var base = $(this).attr('id');
        
        // Magic number here is length of "draggable-block-new-"
        var type = base.substring(20).replace('_', '-');
        
        var element_settings = {
          progress: {
            type: 'none'
          },
          event: 'dragstop',
          url: 'system/ajax/block/add/' + type,
        }
        
        var ajax = new Drupal.ajax(base, this, element_settings);
        Drupal.ajax[base] = ajax;
        
      });
    }
  };
  
  Drupal.behaviors.sortableRegions = {
    attach: function (context, settings) {
    
      $(".region:visible", context).each(function() {
        
        $(this).sortable({
          connectWith: '.region',
          tolerance : 'pointer',
          /*
          start: function(evt, ui) {
            $('.region').addClass('dragging');
            $('.region-sidebar-first, .region-sidebar-second').height($('#main-wrapper').height());
          },
          stop: function(evt, ui) {
            $('.region').removeClass('dragging');
            $('.region-sidebar-first, .region-sidebar-second').height("auto");
          }
          */
        });
        
        
        // Bind Ajax behaviors to all sortable regions
        $('.region:not(.ajax-processed)').addClass('ajax-processed').each(function () {
          
          var element_settings = {
            progress: {
              type: 'none'
            },
            event: 'sortstop',
            url: 'system/ajax/draggable-blocks',
          }
          
          var base = $(this).attr('id');
          
          var ajax = new Drupal.ajax(base, this, element_settings);
          
          // Override this with a version that wraps the original,
          // but returns true. The original returns false under some
          // conditions which makes jQuery UI angry.
          ajax.originalEventResponse = ajax.eventResponse;
          ajax.eventResponse = function (element, event) {
            this.originalEventResponse(element, event);
            return true;
          };
          
          ajax.beforeSerialize = function (element, options) {
            
            // Grab the class property and break it up into class names
            var classes = $(element).attr('class').split(/\s+/);
            var regionName;
            
            for(i in classes) {
              if(classes[i].match(/^region-/)) {
                regionName = classes[i];
                break;
              }
            }

            var blockData = new Array();
            
            $('> div', element).each(function () {
              blockData.push({
                'id': $(this).attr('id'),
                'class': $(this).attr('class'),
              });
            });
            
            options.data['region_name'] = regionName;
            options.data['block_data'] = blockData;
           
            // Call the original fn
            Drupal.ajax.prototype.beforeSerialize(element, options);
          }
          
          Drupal.ajax[base] = ajax;
        });
      });
    }
  };
  
})(jQuery);

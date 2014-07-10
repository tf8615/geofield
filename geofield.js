/**
 * Implements hook_field_formatter_view().
 */
function geofield_field_formatter_view(entity_type, entity, field, instance, langcode, items, display) {
  try {
    var element = {};
    // Determine the format.
    var format = display.settings.format;
    if (format != 'decimal_degrees') {
      console.log('geofield_field_formatter_view - Format not supported! (' + format + ')');
      return element;
    }
    // Iterate over each item and assemble the element.
    $.each(items, function(delta, item) {
        var markup =
        '<p>Latitude: ' + entity[field.field_name][langcode][delta].lat + '<br />' +
        'Longitude: ' + entity[field.field_name][langcode][delta].lon + '</p>';
        element[delta] = {
          markup: markup
        };
    });
    return element;
  }
  catch (error) { console.log('geofield_field_formatter_view - ' + error); }
}

/**
 * Implements hook_field_widget_form().
 */
function geofield_field_widget_form(form, form_state, field, instance, langcode, items, delta, element) {
  try {
    // Convert the form element to a hidden field since we'll populate it with
    // values dynamically later on.
    items[delta].type = 'hidden';
    
    // For a latitude/longitude widget, we create two text fields and a button
    // to get the current position and fill in the two text fields.
    // 删除 onchange 和 _geofield_field_widget_form_change()
    // 因为不能触发 onchange 属性 无法发送给 $('#' + input).val(value);
    if (instance.widget.type == 'geofield_latlon') {
      var lat_id = items[delta].id + '-lat';
      var lat = {
        id: lat_id,
        title: 'Latitude',
        type: 'textfield',
        options: {
          attributes: {
            id: lat_id
          }
        }
      };
      var lon_id = items[delta].id + '-lon';
      var lon = {
        id: lon_id,
        title: 'Longitude',
        type: 'textfield',
        options: {
          attributes: {
            id: lon_id
          }
        }
      };
      var options = {
        lat: lat.id,
        lon: lon.id
      };
      var btn = {
        id: items[delta].id + '-btn',
        text: 'Get current position',
        type: 'button',
        options: {
          attributes: {
            onclick: '_geofield_field_widget_form_click(\'' + lat.id + '\', \'' + lon.id + '\', \'' + items[delta].id + '\')'
          }
        }
      };
      items[delta].children.push(lat);
      items[delta].children.push(lon);
      items[delta].children.push(btn);
    }
    else {
      console.log('WARNING: geofield_field_widget_form() - widget type not supported! (' + instance.widget.type + ')');
    }
  }
  catch (error) { console.log('geofield_field_widget_form - ' + error); }
}

/**
 * 直接获取input 传递给 $('#' + input).val(value);
 */
function _geofield_field_widget_form_click(lat_id, lon_id, input) {
  try {
    navigator.geolocation.getCurrentPosition(
      function(position) {
        var lat = position.coords.latitude;
        var lon = position.coords.longitude;
        $('#' + lat_id).val(lat);
        $('#' + lon_id).val(lon);
        
        var value = lat + ',' + lon;
        $('#' + input).val(value);
      },
      function(error) {
        console.log('_geofield_field_widget_form_click - getCurrentPosition - ' + error);
      },
      {
        enableHighAccuracy: true
      }
    );
  }
  catch (error) { console.log('_geofield_field_widget_form_click - ' + error); }
}

/**
 * Implements hook_assemble_form_state_into_field().
 */
function geofield_assemble_form_state_into_field(entity_type, bundle,
  form_state_value, field, instance, langcode, delta, field_key) {
  try {
    if (empty(form_state_value)) { return null; }
    var coordinates = form_state_value.split(',');
    if (coordinates.length != 2) { return null; }
    // We don't want to use a key for this item's value.
    field_key.value = 'geom';
    field_key.use_key = true;
    // Return the assembled value.
    return {
      lat: coordinates[0],
      lon: coordinates[1]
    };
  }
  catch (error) {
    console.log('geofield_assemble_form_state_into_field - ' + error);
  }
}

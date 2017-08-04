// KodiKontroller init functions

var screen_list = {
    "Screen One"   : "https://scrn1.test.fake:1234",
    "Screen Two"   : "https://scrn2.test.fake:1234",
    "Screen Three" : "https://scrn3.test.fake:1234",
    "Screen Four"  : "https://scrn4.test.fake:1234",
    "Screen Five"  : "https://scrn3.test.fake:1234",
    "Screen Six"   : "https://scrn4.test.fake:1234",
    "Screen Seven" : "https://scrn3.test.fake:1234",
    "Screen Eight" : "https://scrn4.test.fake:1234",
    "Screen Nine"  : "https://scrn3.test.fake:1234",
    "Screen Ten"   : "https://scrn4.test.fake:1234",
};


$(function() {

    // Build the individual interfaces
    var interface_holder = $('section.screens');
    var interface_template = $('article.screen#template');
    var interface_counter = 0;

    // Hide the template
    interface_template.detach()

    // Create interfaces
    for (var screen in screen_list) {

        if (screen_list.hasOwnProperty(screen)) {
        
            var new_screen = interface_template.clone();
            
            new_screen.css({opacity:0});
            
            new_screen.removeAttr('id');
            new_screen.data('kodi-target', screen_list[screen]);
            new_screen.find('h2').text(screen);
            
            new_screen.appendTo(interface_holder);
            new_screen.delay(100*interface_counter++).animate({opacity:1}, 300, 'easeOutSine');
            
        } 
        
    }


    $( 'button' ).each( function() {

        var $this = $(this);
        
        var log = function( msg ) {
            var output = $('[name="response"]');
            output.val( output.val() + msg );
            if(output.length) {
                output.scrollTop(output[0].scrollHeight - output.height());
            }
        }
        
        $this.click( function() {
        
        
            var kodi_address = $this.parent().data('kodi-target');
            var kodi_action  = $this.data('kodi-action');
            var screen_name  = $this.parent().find('h2').text();
            
            var url = $this.parent().find('[name="url"]')[0].value;
            var message = $this.parent().find('[name="message"]')[0].value;
            
            var rpc_data = '';
            
            
            // Create a timestamp
            // (OMFG JS Date formatting sucks...)
            var timestamp = new Date();
            var timestamp_human = ("0"+(timestamp.getDate()+1)).slice(-2) + '/' + ("0"+(timestamp.getMonth()+1)).slice(-2) + '/' + timestamp.getFullYear()
                + ' ' + ("0" + timestamp.getHours()).slice(-2) + ':' + ("0"+timestamp.getMinutes()).slice(-2) + ':' + ("0"+timestamp.getSeconds()).slice(-2);
                
            // Add the timestamp and screen name to the output log
            log('[' + timestamp_human + '] ' + '<' + screen_name + '> : ');     
            
            switch (kodi_action) {
                
                case 'play':
                
                    if (url === '') {
                        // Exit if url is empty
                        // TODO: validate url
                        log("Error: No URL supplied\n");
                        break;
                    }
                    
                    log("Sending URL \"" + url + "\" ... ");
                    
                    // Set the RPC data variable
                    rpc_data= 'request=' + encodeURIComponent( '{"jsonrpc":"2.0","method":"Player.Open","params":{"item":{"file":"' + url + '"}},"id":"1"}' );
                    
                    break;
                
                
                case 'notify':
                
                    if (message === '') {
                        // Exit if message is empty
                        // TODO: escape/check message
                        log("Error: No message supplied\n");
                        break;
                    }
                    
                    log("Sending message \"" + message + "\" ... ");
                    
                    // Set the RPC data variable
                    // Not sure of the details needed here so just commenting out for now and putting a fail message...
                    // rpc_data= 'request=' + encodeURIComponent( '{"jsonrpc":"2.0","method":"Player.Open","params":{"item":{"file":"' + url + '"}},"id":"1"}' );
                    log("FAIL (because the code currently isn't generating RPC data)\n");
                    
                    break;
                
                
                default:
                
                    // Not a recognised action
                    log("Error: unknown action\n");
                    
            }
            
            
            
            // Send the AJAX XHR if rpc_data variable is not the empty string
            if (rpc_data !== '') {
            
                $.ajax({
                    type: 'GET',
                    url: kodi_address + '/jsonrpc',
                    dataType: 'jsonp',
                    jsonpCallback: 'jsonCallback',
                    type: 'GET',
                    async: true,
                    timeout: 5000,
                    data: rpc_data
                })
                
                // If Success, Notify User
                .done( function( data, textStatus, jqXHR ) {
                    if ( jqXHR.status == 200 && data['result'] == 'OK' ) {
                        log("Done\n");
                    } else {
                        log("Error\n");
                    }
                })
                
                // Older Versions Of Kodi/XBMC Tend To Fail Due To CORS But Typically If A '200' Is Returned Then It Has Worked!
                .fail( function( jqXHR, textStatus ) {
                    if ( jqXHR.status == 200 ) {
                        log("Done\n" );
                    } else {
                        log("Error: " + textStatus + "\n" );
                    }
                });
            
            }                
        })
    });
});

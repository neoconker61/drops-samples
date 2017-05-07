/* 
Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. 

A copy of the License is located at http://aws.amazon.com/apache2.0/

or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. 

See the License for the specific language governing permissions and limitations under the License.

 */

  window.onload = function(){

    $.get("/loggedin")
    .done(function (data){
      var userName = data;
      console.log(userName);
      if (userName != '0') {
        addTwitchDisconnectButton();
      }
      else{
        /*
         User has not logged in needs to grant your application access to their vieiwing activity.
         */
        addTwitchConnectButton();
      }
    });
  }


function addTwitchConnectButton(){
  if ($('#twitch-disconnect-button').length ){
    $('#twitch-disconnect-button').hide();
  }

	$('#twitch-button-div').append($('<button/>', {
		"id":"twitch-button-connect",
		"class": "twitch-button connect twitch-connect",
		"html" :  "<svg class='glitch' version='1.1' viewbox='0 0 30 30' x='0px' y='0px'>\
			<path clip-rule='evenodd' d='M21,9h-2v6h2V9z M5.568,3L4,7v17h5v3h3.886L16,24h5l6-6V3H5.568z M25,16l-4,4h-6l-3,3v-3H8V5h17V16z M16,9h-2v6h2V9z' fill-rule='evenodd'></path>\
			</svg><span>Connect</span>"
	}).click(redirectToTwitchAuth));
}

function addTwitchDisconnectButton(){
	if ($('#twitch-connect-button').length ){
		$('#twitch-connect-button').hide();
	}

	$('#twitch-button-div').append($('<button/>', {
		"id":"twitch-button-disconnect",
		"class": "twitch-button disconnect",
		"html" :  "<svg class='glitch' version='1.1' viewbox='0 0 30 30' x='0px' y='0px'>\
			<path clip-rule='evenodd' d='M21,9h-2v6h2V9z M5.568,3L4,7v17h5v3h3.886L16,24h5l6-6V3H5.568z M25,16l-4,4h-6l-3,3v-3H8V5h17V16z M16,9h-2v6h2V9z' fill-rule='evenodd'></path>\
			</svg><span>Disconnect</span>"
	}).click(disconnectFromTwitch));
}

/*
User is redirected to the Twitch Passport page to grant your application access to their viewing activity. Scopes are listed in the URL.
*/
function redirectToTwitchAuth(){
  console.log("Logging into oauth");
  window.location.href="/auth/twitch";
}

/*
This revokes user's access token
*/

function disconnectFromTwitch(){
  $.get("/revoke")
  .done(function (data){
    window.location.reload()
  });
}

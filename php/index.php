<?php
/*

Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

    http://aws.amazon.com/apache2.0/

or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

*/

require 'twitch.php';

$channel = '<duendeconker001>'; // Channel to redirect user to after VHS link is completed. 

$provider = new TwitchProvider([
    'clientId'      => '<YOUR CLIENT ID HERE>',               // The client ID assigned when you created your application
    'clientSecret'  => '<YOUR CLIENT SECRET HERE>',           // The client secret assigned when you created your application
    'redirectUri'   => '<YOUR REDIRECT URL HERE>',            // Your redirect URL you specified when you created your application
    'scopes'        => ['user_read','viewing_activity_read']  // The scopes you would like to request (must have viewing_activity_read)
]);

// If we don't have an authorization code then get one
if (!isset($_GET['code'])) {

    // Fetch the authorization URL from the provider, and store state in session
    $authorizationUrl = $provider->getAuthorizationUrl();
    $_SESSION['oauth2state'] = $provider->getState();

    // Display link to start auth flow
    echo "<html><a href=\"$authorizationUrl\">Click here to link your Twitch Account</a><html>";
    exit;

// Check given state against previously stored one to mitigate CSRF attack
} elseif (empty($_GET['state']) || (isset($_SESSION['oauth2state']) && $_GET['state'] !== $_SESSION['oauth2state'])) {

    if (isset($_SESSION['oauth2state'])) {
        unset($_SESSION['oauth2state']);
    }
    
    exit('Invalid state');

} else {

    try {

        // Get an access token using authorization code grant.
        $accessToken = $provider->getAccessToken('authorization_code', [
            'code' => $_GET['code']
        ]);

        // For creating a VHS link, your player should already be logged into your identity system, 
        // and you should know their player id at this point to create the mapping
        $body = ['identifier' => '<YOUR PLAYER ID>'];
        $options['body'] = json_encode($body);
        $options['headers']['content-type'] = 'application/json';

        // Create VHS connection
        $request = $provider->getAuthenticatedRequest(
            'PUT',
            'https://api.twitch.tv/kraken/user/vhs',
            $accessToken,
            $options
        );

        // Redirect linked user to channel specified
        header('Location: https://www.twitch.tv/'.$channel);

    } catch (Exception $e) {
        exit('Caught exception: '.$e->getMessage());
    }
}

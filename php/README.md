# Twitch Drops PHP Sample
Here you will find a simple PHP application that builds on the authentication sample to illustrate how to link users to the VHS system, to enable Drops.  Additionally you will find a very simple VHS endpoint you can use to get started processing VHS heartbeats.  Please keep in mind that for games with a very high number of broadcasters and viewers, you should decouple the receipt and processing of VHS reports into seperate systems.  

## Installation
After you have cloned this repository, use [Composer](https://getcomposer.org/) to install the OAuth library.

```sh
$ composer require league/oauth2-client
```

## Structure
This sample contains two files:

1. twitch.php - This is the actual Twitch OAuth2 provider class, using the abstract provider class as a base.
2. index.php - This file uses twitch.php to authenticate the user, and create the link in VHS.
3. vhs/index.php - This file acts as a very simple starting point for receiving and parsing VHS heartbeats.

## Usage
Before running this sample, you will need to set four configuration fields at the top of index.php:

1. channel - This is the channel the user will be redirected to after they link their account. It can be any channel, but likely your game's official channel.
2. clientId - This is the Client ID of your registered application.  You can register an application at [https://www.twitch.tv/settings/connections]
3. clientSecret - This is the secret generated for you when you register your application, do not share this. In a production environment, it is STRONGLY recommended that you do not store application secrets on your file system or in your source code.
4. redirectUri - This is the callback URL you supply when you register your application.

Additionally, you must register your application for Drops on the [developer portal](https://devportal.twitch.tv/)

After setting these fields, you may run the sample in any local or hosted PHP environment you prefer.  In order to receive live VHS reports, your endpoint must be publically accessible and configured to handle HTTPS requests.

## Next Steps
From here you can add as many pages as you want and create a real web app for Twitch users.

## License

Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

    http://aws.amazon.com/apache2.0/

or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License. 
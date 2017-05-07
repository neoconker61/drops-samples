<?php
/*

Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

    http://aws.amazon.com/apache2.0/

or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

*/

$heartbeat =  json_decode(file_get_contents('php://input'), TRUE);

if ($heartbeat)
{
    foreach ($heartbeat["viewer_list"] as $viewer)
    {
        // Reward logic for viewers, $viewer contains player ID
        // Can provide reward based on chance or accumulated minutes watched
    }

    // Optionally you can provide unique reward logic for broadcasters ($heartbeat["broadcaster"])
}
else
{
    http_response_code(400);
    exit("Error: Could not parse heartbeat JSON.");
}

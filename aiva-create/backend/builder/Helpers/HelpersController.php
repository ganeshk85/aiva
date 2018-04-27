<?php namespace Builder\Helpers;

use Silex\Application;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use GuzzleHttp\Exception\GuzzleException;
use GuzzleHttp\Client;

class HelpersController {

    /**
     * Check if Twitter's username is correct.
     *
     * @param Request     $request
     */
    public function verifyTwitterUsername(Request $request) {
        $key = 'u5UuLMaLa3WdmFKHQxrRg';
        $secret = 'hhXwnb8JYfF2oFZtYvPACkfktVpDQaX7FPJTjy9VY';
        $basicToken = base64_encode($key . ':' . $secret);

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'https://api.twitter.com/oauth2/token');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        $headers = [
            'Authorization: Basic ' . $basicToken
        ];
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch,CURLOPT_POSTFIELDS, 'grant_type=client_credentials');
        $server_output = curl_exec ($ch);
        $json = json_decode($server_output);

        if(@$json->access_token) {
            $access_token = $json->access_token;

            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, 'https://api.twitter.com/1.1/users/show.json?screen_name=' . $request->get('username'));
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            $headers = [
                'Authorization: Bearer '.$access_token
            ];
            curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
            $server_output = curl_exec ($ch);
            $json = json_decode($server_output);

            if(@$json->id) {
                return 'true';
            }

            return 'false';
        }

        return 'false';
    }
}

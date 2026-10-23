<?php
ini_set('display_errors', '1');
error_reporting(E_ALL);
header("Content-Type: application/json; charset=UTF-8");

function sendJson($status, $data) {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    sendJson(405, ["error" => "POST requests only"]);
}

$configFile = __DIR__ . "/config.php";

if (!file_exists($configFile)) {
    sendJson(500, ["error" => "Configuration file not found."]);
}

require_once $configFile;

if (!defined("OPENAI_API_KEY") ||
    OPENAI_API_KEY === "PUT_YOUR_API_KEY_HERE" ||
    trim(OPENAI_API_KEY) === "") {
    sendJson(500, ["error" => "Please configure the API key."]);
}

$input = json_decode(file_get_contents("php://input"), true);
$message = trim($input["message"] ?? "");

if ($message === "") {
    sendJson(400, ["error" => "Please enter a question."]);
}

if (strlen($message) > 2000) {
    sendJson(400, ["error" => "Please keep your question under 2000 characters."]);
}

if (!function_exists("curl_init")) {
    sendJson(500, ["error" => "PHP cURL is not enabled in XAMPP."]);
}

$payload = [
    "model" => "gpt-6-luna",
    "instructions" => "You are a helpful weather assistant. Answer questions about weather and explain weather concepts clearly. If asked about current weather, explain that you need live weather data to provide current conditions.",
    "input" => $message,
    "max_output_tokens" => 400
];

$ch = curl_init("https://api.openai.com/v1/responses");

curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        "Content-Type: application/json",
        "Authorization: Bearer " . OPENAI_API_KEY
    ],
    CURLOPT_POSTFIELDS => json_encode($payload),
    CURLOPT_CONNECTTIMEOUT => 15,
    CURLOPT_TIMEOUT => 60
]);

$result = curl_exec($ch);
$curlError = curl_error($ch);
$status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($result === false) {
    error_log("OpenAI connection error: " . $curlError);
    sendJson(502, ["error" => "Could not connect to the AI service."]);
}

$responseData = json_decode($result, true);

if ($status < 200 || $status >= 300) {
    error_log("OpenAI API error HTTP " . $status . ": " . $result);
    sendJson(502, [
        "error" => "The AI service returned an error (HTTP " . $status . "). Check API access and billing."
    ]);
}

$reply = "";

foreach (($responseData["output"] ?? []) as $item) {
    if (($item["type"] ?? "") === "message") {
        foreach (($item["content"] ?? []) as $content) {
            if (($content["type"] ?? "") === "output_text") {
                $reply .= $content["text"] ?? "";
            }
        }
    }
}

if ($reply === "") {
    sendJson(502, ["error" => "The AI service returned no text."]);
}

sendJson(200, ["reply" => $reply]);
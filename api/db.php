<?php
$host = "localhost";
$user = "root";
$pass = ""; // الباسورد الافتراضي في XAMPP بيكون فاضي
$dbname = "weather_app";

$conn = new mysqli($host, $user, $pass, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
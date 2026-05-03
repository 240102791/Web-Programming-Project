<?php
include 'db.php';

if (isset($_POST['city'])) {
    $city = $conn->real_escape_string(trim($_POST['city']));
    
    // التأكد إن المدينة مش متسجلة قبل كده عشان نمنع التكرار في القائمة
    $check = $conn->query("SELECT * FROM search_history WHERE city_name = '$city'");
    
    if ($check->num_rows == 0) {
        $conn->query("INSERT INTO search_history (city_name) VALUES ('$city')");
    }
}
?>
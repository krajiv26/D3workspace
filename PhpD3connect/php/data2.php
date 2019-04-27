<?php

    $servername = "localhost";
    $username = "root";
    $password = "123456";
    $dbname = "d3js";

    // Create connection
    $conn = new mysqli($servername, $username, $password, $dbname);
    // Check connection
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    } 
    
    $sql = "SELECT  `date`, `close` FROM  `data2`";
    $result = $conn->query($sql);

    
    if ( ! $result ) {
        echo mysqli_error();
        die;
    }
    $data = array();
    if ($result->num_rows > 0) {
        // output data of each row
        while($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
    } else {
        echo "0 results";
    }
    

   
    echo json_encode($data);     
     
    $conn->close();

//  d3.json("php/data2.php", function(error, data) {
//     data.forEach(function(d) {
//         d.date = parseDate(d.date);
//         d.close = +d.close;
//     });


?>
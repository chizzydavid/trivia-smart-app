<?php 

if (isset($_GET['type'])) {
	$query = http_build_query($_GET);
	$url = "https://opentdb.com/api.php?$query";//"http://www.omdbapi.com/?i=tt3896198&apikey=47bda626" ;



	$ch = curl_init();

	curl_setopt_array($ch, 
		array(
			CURLOPT_URL => $url,
			CURLOPT_RETURNTRANSFER => true,
			//CURLOPT_HEADER => true
		 )
	);

	$result = curl_exec($ch);
	curl_close($ch);
	echo($result);

}


?>
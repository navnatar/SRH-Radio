	//Resetting the UserId and UserPwd fields back to null
	function ClearFields() {
		 document.getElementById("userEmail").value = "";
		 document.getElementById("userPassword").value = "";
	}

	//
	function backToIni(){
		sessionStorage.clear(); 
		window.history.forward();
		window.location.assign("login.html");
	}

	function downloadFunc()
	{
		var podCastName = sessionStorage.getItem("podCastname");
		var podCastLink = "music/" + podCastName;
		document.getElementById("downloadLink").setAttribute("href",podCastLink);
		document.getElementById("downloadLink").setAttribute("download",podCastName);
	}

	//this function is used to validate the user, and redirect to the mainpage
	function validateUser(useremail,password)
	{
	if(useremail=='')
	{
	alert("Please enter the user name");
	return false;
	}
	else if(password=='')
	{
	alert("Please enter the password");
	return false;
	}
	else
	{
		//getting the resource from the rails server deployed at heroku
		$.ajax({
			type: 'GET',
			url: 'https://srh-radio.herokuapp.com/podcasts.js',
			data: {"filter":"login","useremail":useremail,"password":password},
			dataType: 'JSONP',
			success: function(data){
			if(data.length>0)
			{
				window.location.assign("mainpage.html");		
				alert("logged in as: "+data[0].username)
				//Code added to pass it store username in the session variable 
				sessionStorage.setItem("userEmailId",data[0].username);
				sessionStorage.setItem("userid",data[0].id)
				}
			else
			 alert("useremail or password entered is wrong")
			},
			error: function (error){
				alert("Useremail or password not found..!")
			}
	});
	}
	}

//the main function for loading all three major parts of the page featuredpodcast,toprated,favourites and used for podcast search	
	var songList;
	function searchFunction(searchText) {
	var returnData;	
		if (searchText=="toprated")
		{
			returnData="toprated";
		}
		else if (searchText=="favourites")
		{
			returnData="favourites";
		}
		else
		{
			returnData="all_podcasts";
		}
		//getting the resource from the rails server deployed at heroku
	  $.ajax({
			type: 'GET',
			url: 'https://srh-radio.herokuapp.com/podcasts.js',
			data: {"filter" : returnData,"user_id" :sessionStorage.getItem("userid")},
			dataType: 'JSONP',
			success: function(data){
		var searchResults = new Array();   
		var regex_search = new RegExp("\\b"+searchText+"\\b","i");
		var objCount = data.length;
		var out='<div class="head"><p class="centr">PODCAST</p><p class="right">CATEGORY</p></div>';
		var matchcounter=0;
		if(searchText=="displayAll" || searchText=="toprated" || searchText=="favourites" )
		{ 
		for (var j=0; j< objCount; j++ ){
			if((matchcounter%2)==0){
				out+='<div class="playListDark"><p onclick="playSong(this)" data-filename="'+data[j].podcastName +'" class="track">'+data[j].podcastName
				+'</p><p class="artist">'+data[j].category+'</p></div>';
				}
			else
				{out+='<div class="playListLight"><p onclick="playSong(this)" data-filename="'+data[j].podcastName +'" class="track">'+data[j].podcastName
				+'</p><p class="artist">'+data[j].category+'</p></div>';}
				matchcounter++
				}
		}
		else
		{		
		for (var j=0; j< objCount; j++ ){
			if(regex_search.test(data[j].subcategory) || regex_search.test(data[j].podcastName )  || regex_search.test(data[j].category)) {
			if((matchcounter%2)==0){
				out+='<div class="playListDark"><p onclick="playSong(this)" data-filename="'+data[j].podcastName +'" class="track">'+data[j].podcastName
				+'</p><p class="artist">'+data[j].category+'</p></div>';
				}
			else
				{out+='<div class="playListLight"><p onclick="playSong(this)" data-filename="'+data[j].podcastName +'" class="track">'+data[j].podcastName
				+'</p><p class="artist">'+data[j].category+'</p></div>';}
				matchcounter++
				}
			  }
		}
			  out+='<div class="playListLight"><p class="bot">&nbsp;</p></div>';


			   if (searchText=="toprated")
				{
					document.getElementById("ratedTop").innerHTML = out;
				}
				else if (searchText=="favourites")
				{
					document.getElementById("favouritesTop").innerHTML = out;
				}
				else 
				{
					document.getElementById("playListBody").innerHTML = out;
						songList=data;
				}			
				
				if (searchText=="toprated" && matchcounter==0)
				{
					out="<h2>no top rated podcasts yet..!</h2>"
					document.getElementById("ratedTop").innerHTML = out;
				}
				else if (searchText=="favourites" && matchcounter==0)
				{
					out="<h2>you have not added any podcasts to favourites</h2>"
					document.getElementById("favouritesTop").innerHTML = out;
				}
				else if(matchcounter==0)
				{
					out="<h2>no matches found</h2>"
					document.getElementById("playListBody").innerHTML = out;
						
				}
				if(searchText=="displayAll")
				{
								 name=data[0].podcastName;
								 desc=data[0].description;
								 category=data[0].category;
								 id=data[0].id;
						document.getElementById("podName").innerHTML = name;
						//Added sessionStorage
						sessionStorage.setItem("podCastname",name);
						document.getElementById("podCategory").innerHTML = category;
						document.getElementById("podDesc").innerHTML = desc;
						//display existing comments for the podcast
						var returnData = "comment";
							$.ajax({
								type: 'GET',
								url: 'https://srh-radio.herokuapp.com/podcasts.js',
								data: {"id":id,"filter":returnData},
								dataType: 'JSONP',
								success: function(data){
							if(data.length>0)
							{		
								var Count = data.length;
								var comment='';
								for (var i=0; i< Count; i++ )
								{
								  if(id==data[i].podcast_id)
										 {
										 comment+=data[i].username+'<=>'+data[i].comments+'</br>';
										 }
										 }
								document.getElementById("comContent").innerHTML = comment;
							}
							else 
							{
								document.getElementById("comContent").innerHTML = ".......................be the first to comment........................."
							}	
						}
						});
						var audio = document.getElementById('audio');
						var source = document.getElementById('mp3Source');
						//trying to fetch the audio files from the Amazon webservices server
						source.src='http://srh-radio-music.s3-website.eu-central-1.amazonaws.com/music/'+data[0].podcastName;
						audio.load();
				}
			}
		}); 
		}

	// <!-- the part for dislaying the categories -->

	// <!-- function to generate the categories menu -->

	function catDisp() {
	var returnData = "categories";
		//getting the resource from the rails server deployed at heroku
		$.ajax({
			type: 'GET',
			url: 'https://srh-radio.herokuapp.com/podcasts.js',
			data: {"filter" : returnData},
			dataType: 'JSONP',
			success: function(data){
			var categoriesOutput = "";
		var i;
		var category="";
		for(i = 0; i < data.length; i++) {
		   if(i==0)
			{
			 categoriesOutput+='<details onclick="closeAll(thisindex(this));"><summary>'+data[i].category+'</summary><input type="checkbox" id="'+
			 data[i].subcategory+'" value="'+data[i].subcategory+'" onclick="searchFunction(this.id)"/><label for="'+data[i].subcategory+'">'+data[i].subcategory+"<br>"; 
			}       
			   
		  else if(data[i].category==category)
		   {
				categoriesOutput+='<input type="checkbox" id="'+data[i].subcategory+'" value="'+data[i].subcategory+'" onclick="searchFunction(this.id)"/><label for="'
				+data[i].subcategory+'">'+data[i].subcategory+"<br>"; 
			
			}
			else
			{
			categoriesOutput+='</details><details onclick="closeAll(thisindex(this));"><summary>'+data[i].category+'</summary><input type="checkbox" id="'+data[i].subcategory+'" value="'
			+data[i].subcategory+'" onclick="searchFunction(this.id)"/><label for="'+data[i].subcategory+'">'
					+data[i].subcategory+"<br>"; 
			}
			category=data[i].category;
			
			}
	categoriesOutput+='</details>'		
	document.getElementById("categoryMenu").innerHTML = categoriesOutput;        
		
			}
		});     
			}
	function thisindex(detailsElement){
			var nodes = detailsElement.parentNode.childNodes, node;
			var i = 0, count = 0;
			while( (node=nodes.item(i++)) && node!=detailsElement )
			if( node.nodeType==1 ) count++;
			return count;
		  }

		  function closeAll(index){
			var detailsLength = document.getElementsByTagName("details").length;
			for(var i=0; i<detailsLength; i++){
			  if(i != index){
				document.getElementsByTagName("details")[i].removeAttribute("open");
			  }
			}
		  }		
	// <!-- function to play a song -->
	var desc,name,category,id;
	function playSong(songName) {
	var regex_search = new RegExp("\\b"+songName.getAttribute("data-filename")+"\\b","i");
	var objCount = songList.length;
	for (var j=0; j< objCount; j++ ){
			 if((songList[j].podcastName.match(regex_search)))
			 {
			 name=songList[j].podcastName;
			 desc=songList[j].description;
			 category=songList[j].category;
			 id=songList[j].id;
			 }
			 }
	document.getElementById("podName").innerHTML = name;
	//Added sessionStorage
	sessionStorage.setItem("podCastname",name);
	document.getElementById("podCategory").innerHTML = category;
	document.getElementById("podDesc").innerHTML = desc;
	//display existing comments for the podcast
	var returnData = "comment";
		//getting the resource from the rails server deployed at heroku
		$.ajax({
			type: 'GET',
			url: 'https://srh-radio.herokuapp.com/podcasts.js',
			data: {"id":id,"filter":returnData},
			dataType: 'JSONP',
			success: function(data){
		if(data.length>0)
		{		
			var Count = data.length;
			var comment='';
			for (var i=0; i< Count; i++ )
			{
			  if(id==data[i].podcast_id)
					 {
					 comment+=data[i].username+'=>'+data[i].comments+'</br>';
					 }
					 }
			document.getElementById("comContent").innerHTML = comment;
		}
	}
	});
	var audio = document.getElementById('audio');
	var source = document.getElementById('mp3Source');
	//Fetch the podcasts from amazon webservices.
	source.src='http://srh-radio-music.s3-website.eu-central-1.amazonaws.com/music/' + songName.getAttribute("data-filename");
	audio.load();
	audio.play();
	var ele = document.getElementsByName("rate");
		for(var i=0;i<ele.length;i++)
			ele[i].checked = false;
	}

	//function to update comments added by users
	function insertComment(comment){
		 $.ajax({
			type: 'GET',
			url: 'https://srh-radio.herokuapp.com/podcasts/new.js',
			data: {"field":"comment","podcast_id":id,"comments":comment,"user_id":sessionStorage.getItem("userid")},
			dataType: 'JSONP',
			success: function(data){
				alert("the comment has been added")
			}
	});
	document.getElementById("commentbox").value = "";
	}

	function rating(value){	
		$.ajax({
			type: 'GET',
			url: 'https://srh-radio.herokuapp.com/podcasts/new.js',
			data: {"field":"rating","podcast_id":id,"rating":value,"user_id":sessionStorage.getItem("userid")},
			dataType: 'JSONP',
			success: function(data){
				alert("the podcast has been rated at: "+data[0].rating)
			}
	});
	}
	//function to add podcasts to favourites
	function favourites(value){
		 $.ajax({
			type: 'GET',
			url: 'https://srh-radio.herokuapp.com/podcasts/new.js',
			data: {"field":value,"podcast_id":id,"user_id":sessionStorage.getItem("userid")},
			dataType: 'JSONP',
			success: function(data){
				alert("the podcast is added to your favourites")
			}
	});
	}



$(document).ready(function(){
	// listen for device ready
	document.addEventListener('deviceready',onDeviceReady, false);
});

function onDeviceReady(){
	console.log('onDeviceReady');
	//var channel = 'TechGuyWeb';
	//var channel = 'nikola.babic';

	// check LocalStorage for channel
	if ((localStorage.channel == null) ||(localSotrage.channel == '')) {
		// popup - ask user for channel
		$('#popupDialog').popup('open');
	} else {
		var channel = localStorage.getItem('channel');
	}
		
	// get youtube playlist
	getPlaylist(channel);
	
	// event handlers
	// display video when clicking list item
	$(document).on('click', '#vidlist li', function(){
		// pass custom attribute videoid
		showVideo($(this).attr('videoId'));
	});
	
	// save to localstorage when clicking channelBtnOK
	$('#channelBtnOK').click(function(){
		var channel = $('#channelName').val();
		setChannel(channel);
		// refresh playlist
		getPlaylist(channel);
	});
	
	// save options when clicking saveOptions button
	$('#saveOptions').click(function(){
		saveOptions();
	});
	
	// clear channel when clicking clearChannel button
	$('#clearChannel').click(function(){
		clearChannel();
	});
	
	// display options page on init
	$(document).on('pageinit','#options',function(e){
		console.log('options page loaded');
		// get values from local storgae
		var channel = localStorage.getItem('channel');
		var maxResults = localStorage.getItem('maxResults');
		
		// set values to screen fields 
		$('#channelNameOptions').attr('value', channel);
		$('#maxResultsOptions').attr('value', maxResults);
	});
}

function getPlaylist(channel){
	console.log('getPlaylist ' + channel);
	
	var maxResults = localStorage.getItem('maxResults');
	if ((maxResults == '') || (maxResults == null)){
		console.log('10');
		var maxResults = 10;
	} else {
		console.log('maxResults localstorage');
	}
	
	// clear vidlist
	$('#vidlist').html('');
	
	$.get(
			"https://www.googleapis.com/youtube/v3/channels",
			{
				part: 'contentDetails',
				forUsername: channel,
				key:'AIzaSyAHMihsFkghgijAr5yhgeFg5fb2nRE9V_8' // our public api key (from google)
			},
			function(data){
				console.log(data);
				// loop over data
				$.each(data.items, function(i, item){
					//console.log(item);
					playlistId = item.contentDetails.relatedPlaylists.uploads;
					getVideos(playlistId, maxResults);
				});
			}
		);
}

function getVideos(playlistId, maxResults){
	console.log('getVideos');
	$.get(
		"https://www.googleapis.com/youtube/v3/playlistItems",
		{
			part: 'snippet',
			maxResults: maxResults,
			playlistId: playlistId,
			key:'AIzaSyAHMihsFkghgijAr5yhgeFg5fb2nRE9V_8'
		}, function(data){
			console.log(data);
			var output;
			// loop over data items (videos)
			$.each(data.items, function(i, item){
				console.log(item);
				id = item.snippet.resourceId.videoId;
				title = item.snippet.title;
				thumb = item.snippet.thumbnails.default.url;
				// display on page
				$('#vidlist').append('<li videoId="'+id+'"><img src="'+thumb+'"><h3>'+title+'</h3></li>');
				$('#vidlist').listview('refresh');
			});
		}
		);
}

function showVideo(id){
	console.log('showVideo ' + id);
	$('#logo').hide();
	//output is youtube embedded code
	var output = '<iframe width="100%" height="250" src="https://www.youtube.com/embed/' + id + '" frameborder="0" allowfullscreen></iframe>';
	$('#showVideo').html(output)
}

function setChannel(channel){
	console.log('set channel ' + channel);
	localStorage.setItem('channel', channel);
	console.log(channel + ' channel set');
}

function setMaxResults(maxResults){
	console.log('setMaxResults ' + maxResults);
	localStorage.setItem('maxResults', maxResults);
	console.log(maxResults + ' maxResults set');
}


function clearChannel(){
	console.log('clearChannel ');
	localStorage.removeItem('channel');
	
	// change to main screen and clear playlist
	$('body').pagecontainer('change', '#main', {options});
	$('#vidlist').html('');
	// show popup
	$('#popupDialog').popup('open');
}

function saveOptions(){
	console.log('saveOptions ');
	
	// get field values and save them
	var channel = $('#channelNameOptions').val();
	setChannel(channel);
	
	var maxResults = $('#maxResultsOptions').val();
	setMaxResults(maxResults);
	
	// change to main screen and display playlist
	$('body').pagecontainer('change', '#main', {options});
	getPlaylist(channel);
}
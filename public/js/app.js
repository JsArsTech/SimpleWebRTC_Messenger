
window.addEventListener('load', () => {

	const chatTemplate = Handlebars.compile($('#chat-template').html());
	const chatContentTemplate = Handlebars.compile($('#chat-content-template').html());	
	const chatEl = $('#chat');
	const formEl = $('.form');
	const messages = [];
	let userName;

	const localImageEl = $('#local-image');
	const localVideoEl = $('#local-video');

	const remoteVideoTemplate = Handlebars.compile($('#remote-video-template').html());
	const remoteVideoEl = $('#remote-videos');
	let remoteVideosCount = 0;

	localVideoEl.hide();
	/*
	console.log(formEl);
	
	formEl.form({
		fields: {
			rootName: 'empty',
			username: 'empty'
		}
	});
	*/

	const webrtc = new SimpleWebRTC({
		  localVideoEl: 'local-video',
		  remoteVideosEl: 'remote-videos',
		  autoRequestMedia: true,
		  debug: false
	});

	webrtc.on('localStream', () => {
		localImageEl.hide();
		localVideoEl.show()
	});

	webrtc.on('videoAdded', (video, peer) => {

		const id = webrtc.getDomId(peer);
		const html = remoteVideoTemplate({ id });
		if (remoteVideosCount === 0) {
			remoteVideosEl.html(html);
		}
		else {
			remoteVideosEl.append(html);
		}
		
		$(`#${id}`).html(video);
		$(`#${id} video`).addClass('ui imagen medium');
		remoteVideosCount += 1;		
	});

	const updateChatMessages = () => {
		const html = chatContentTemplate({ messages });
		const chatContentEl = $('#chat-content');
		chatContentEl.html(html);

		const scrollHeight = chatContentEl.prop('scrollHeight');
		chatContentEl.animate({ scrollTop: scrollHeight }, 'slow');
	};

	const postMessage = (message) => {
		const chatMessage = {
			userName,
			message,
			postedOn: new Date().toLocaleString('en-GB')
		};

		webrtc.sendToAll('chat', chatMessage);

		messages.push(chatMessage);

		$('#post-message').val('');

		updateChatMessages();
	};

	const showChatRoom = (room) => {

		formEl.hide();
		const html = chatTemplate({ room });
		chatEl.html(html);
		const postForm = $('form');
		/*
		postForm.form({
			message: 'empty'
		});
		*/
		$('#post-btn').on('click', () => {
			const message = $('#post-message').val();
			postMessage(message);
		});
		$('#post-message').on('keyup', (event) => {
			if (event.keyCode === 13) {
				const message = $('#post-message').val();
				postMessage(mesage);
			}
		});
	};

	const createRoom = (roomName) => {

		console.info(`Creating new room: ${roomName}`);
		webrtc.createRoom(roomName, (err, name) => {
			formEl.trigger('reset');
			showChatRoom(name);
			postMessage(`${userName} created chatroom`);
		});
	};

	const joinRoom = (roomName) => {

		console.log(`Joining Room: ${roomName}`);
		webrtc.joinRoom(roomName);
		showChatRoom(roomName);
		postMessage(`${userName} joined chatroom`);
	};

	webrtc.connection.on('message', (data) => {
		if (data.type === 'chat') {
			const message = data.payload;
			messages.push(message);
			updateChatMessages();
		}
	});

	$('.submit').on('click', (event) => {
		/*
		if (!formEl.form('is valid')) {
			return false;
		}
		*/
		userName = $('#userName').val();
		const roomName = $('#roomName').val().toLowerCase();
		if (event.target.id === 'create-btn') {
			createRoom(roomName);
		}
		else {
			joinRoom(roomName);
		}
		return false;
	});
});
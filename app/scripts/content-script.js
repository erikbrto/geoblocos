(() => {
  function getLoginInfo() {
    const pageUsername = document.body.getElementsByClassName('username');
    const isLoggedIn = pageUsername.length === 1 ? true : false;
    const username = isLoggedIn 
      ? pageUsername[0].textContent.trim() 
      : null;

    return {
      isLogged: isLoggedIn,
      username: username,
    };
  }

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const { type, data } = request;

    switch (type) {
      case 'GET-LOGIN':
        sendResponse({
          type: 'LOGIN-INFO',
          data: getLoginInfo(),
        });
        break;

      default:
        console.log(`invalid message: ${request}`);
        break;
    }
  });
})();

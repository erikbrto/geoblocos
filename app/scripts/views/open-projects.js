function removeContentCards(contentBox) {
  const cards = contentBox.getElementsByClassName('content-card');

  for (let i = cards.length - 1; i >= 0; i--) {
    cards[i].remove();
  }
}

export function showOpenProjects() {
  const contentBox = document.getElementById('content-box');

  removeContentCards(contentBox);
}

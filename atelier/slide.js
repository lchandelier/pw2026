var n = document.getElementById('wrappernav');
n.classList.add('is-closed');
function navi() {
	
	if (window.matchMedia("(max-width:48em)").matches && document.getElementById("toggle-nav")==undefined) {			
		n.insertAdjacentHTML('afterBegin','<button id="toggle-nav"><span class="text">Voir les liens</span></button>');

		
		var t = document.getElementById('toggle-nav');  
		t.onclick=function(){
			n.classList.toggle('is-closed');
		}
	}
	if (window.matchMedia("(min-width:48em)").matches && document.getElementById("toggle-nav")) {
		document.getElementById("toggle-nav").outerHTML="";
	}
}

navi();
window.addEventListener('resize', navi);

hljs.initHighlightingOnLoad();
/* Onglets de la section « Nos forfaits » */

document.addEventListener('DOMContentLoaded', function () {

    var tabs = document.querySelectorAll('.tabs div');
    var panels = document.querySelectorAll('.plans .panel');

    function show(index) {
        for (var i = 0; i < tabs.length; i++) {
            tabs[i].classList.remove('on');
            panels[i].classList.add('hidden');
        }
        tabs[index].classList.add('on');
        panels[index].classList.remove('hidden');
    }

    for (var i = 0; i < tabs.length; i++) {
        (function (index) {
            tabs[index].addEventListener('click', function () {
                show(index);
            });
        })(i);
    }

});
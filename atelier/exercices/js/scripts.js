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

document.querySelector('.submit-btn').addEventListener('click', function (e) {
    e.preventDefault();

    var fields = [
        { el: document.getElementById('nom') },
        { el: document.getElementById('email'), pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
        { el: document.getElementById('telMobile') },
        { el: document.getElementById('pays') }
    ];

    fields.forEach(function (field) {
        var fieldValue = field.el.value.trim();
        var inError = fieldValue === '' || (field.pattern && !field.pattern.test(fieldValue));

        field.el.style.border = inError ? ' 1px solid red' : '';
        document.getElementById('errorMsg').style.display = 'block';
    });
});
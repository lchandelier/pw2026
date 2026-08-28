/**
AccesSlide
GPL licence
https://github.com/access42/AccesSlide
Copyright (c) 2015 Access42, access42.net
**/

// @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3-or-Later
var AccessSlide = (function () {
	'use strict';

	/** Element ids into the page. **/
	var ID = {
		screen: 'screen',
		banner: 'banner',
		main: 'main',
		navbar: 'navbar',
		wrapperNav: 'wrappernav',
		wrapper: 'wrapper',
		flap: 'volet',
		summary: 'sommaire',
		summaryTitle: 'Ct',
		setting: 'setting',
		settingTitle: 'Ctitle',
		formConfig: 'FormConfig',
		configButtons: 'configbutton',
		liveTitle: 'Dcourante',
		audio: 'Caudio',
		effectSelect: 'Effects',
		closeSummary: 'close',
		closeConfig: 'Close2',
		save: 'setconfig',
		reset: 'resetconfig',
		prev: 'prev',
		next: 'next',
		gotoSelect: 'tocP',
		gotoButton: 'tocp',
		gotoWrapper: 'Fgo',
		summaryButton: 'toc',
		configButton: 'set',
		counter: 'cpt',
		counterCurrent: 'current',
		counterTotal: 'total',
	};

	/** CSS class names. **/
	var CLS = {
		slide: 'slide',
		hidden: 'Cmasque',
		cover: 'cover',
		linearMode: 'modeplan',
		wrapperLeft: 'Cagauche',
		summaryFixed: 'fixed tool-block tool-block-summary',
		blockTitle: 'tool-block-title',
		linearIndex: 'index',
		configButtons: 'btn-group-settings',
		settingButton: 'btn-setting',
		closeButton: 'btn-close',
		counter: 'tool-bar-elt slide-counter',
		counterCurrent: 'tool-bar-elt slide-counter-current',
		counterTotal: 'tool-bar-elt slide-counter-total',
		srOnly: 'sr',
		gotoWrapper: 'go-to-wrapper',
		gotoSelect: 'select-goto',
		prefInput: 'input-setting',
		prefHelp: 'help',
	};

	var EFFECTS = {
		Eno: { className: null, target: null },
		Efadin: { className: 'fadein', target: 'slide' },
		Eleft: { className: 'ALTR', target: 'flap' },
		Eright: { className: 'ARTL', target: 'flap' },
		Ebottom: { className: 'ATtoT', target: 'flap' },
		Etop: { className: 'ATtoB', target: 'flap' },
		Flash: { className: 'Flash', target: 'flap' },
		Escale: { className: 'Escale', target: 'slide' },
		Flip: { className: 'Flip', target: 'slide' },
	};

	/** Order of the options in the effects dropdown. **/
	var EFFECT_ORDER = [
		'Eno',
		'Efadin',
		'Eleft',
		'Eright',
		'Ebottom',
		'Etop',
		'Flash',
		'Escale',
		'Flip',
	];

	var DEFAULT_EFFECT = 'Eno';

	/**
	 * User preferences.
	 * `name` is both the storage key, the input id and the lang key.
	 * `group` decides which fieldset the checkbox lands in, and the order
	 * of this list is the order of the settings dialog.
	 **/
	var PREFS = [
		// Vocalize slide number on total ("1 of 4")
		{
			name: 'VocalizeNdiapo',
			group: 'Gaccess',
			def: 0,
			labelClass: 'label-setting setting-sound',
		},
		// Beep when revealing hidden text
		{
			name: 'SoundTxt',
			group: 'Gaccess',
			def: 0,
			labelClass: 'label-setting setting-sound',
		},
		// Beep when displaying a slide
		{
			name: 'SoundSlide',
			group: 'Gaccess',
			def: 0,
			labelClass: 'label-setting setting-sound',
		},
		// Beep on the first slide
		{
			name: 'SoundSlide1',
			group: 'Gaccess',
			def: 0,
			labelClass: 'label-setting setting-sound',
		},
		// Beep on the last slide
		{
			name: 'SoundSlideEnd',
			group: 'Gaccess',
			def: 0,
			labelClass: 'label-setting setting-sound',
		},
		// Vocalize the heading of the current slide
		{
			name: 'VocalizeTitle',
			group: 'Gaccess',
			def: 0,
			labelClass: 'label-setting setting-sound',
		},
		// Update the window title
		{
			name: 'UpWindowTitle',
			group: 'Gaccess',
			def: 0,
			labelClass: 'label-setting setting-sound',
		},
		// Move focus to the "next" button on load
		{
			name: 'GotoBnext',
			group: 'Gaccess',
			def: 0,
			labelClass: 'label-setting setting-next',
		},
		// Disable click-to-advance (also disables the spacebar)
		{
			name: 'Noclick',
			group: 'Gaccess',
			def: 1,
			labelClass: 'label-setting setting-mouse',
		},
		// Summary as a modal (1) or inline (0)
		{
			name: 'SumModOn',
			group: 'Gslide',
			def: 1,
			labelClass: 'label-setting setting-summary',
		},
		// Linear layout instead of slideshow
		{
			name: 'ModePlan',
			group: 'Gslide',
			def: 0,
			labelClass: 'label-setting setting-plan',
		},
	];

	/** Audio cues: element id, file basename, and the pref that enables it. **/
	var SOUNDS = [
		{ pref: 'SoundTxt', id: 'Stexte', file: 'bip_texte_masque' },
		{ pref: 'SoundSlide', id: 'Sdiapo', file: 'bip_diapo_on' },
		{ pref: 'SoundSlide1', id: 'Sdiapo1', file: 'bip_diapo1_on' },
		{ pref: 'SoundSlideEnd', id: 'Sdiapoend', file: 'bip_diapo_end' },
	];

	var SOUND_PATH = 'sound/';

	/** Elements that keep their own click / enter behaviour. **/
	var INTERACTIVE_TAGS = [
		'BUTTON',
		'A',
		'SELECT',
		'INPUT',
		'AUDIO',
		'VIDEO',
		'TEXTAREA',
		'LABEL',
	];

	/** Keys we listen to. Modifiers are prefixed, see keyRef(). **/
	var HANDLED_KEYCODES = [9, 13, 27, 32, 33, 34, 35, 36, 37, 38, 39, 40, 48];

	var KEY = {
		ENTER: 13,
		ESC: 27,
		SPACE: 32,
		PAGE_UP: 33,
		PAGE_DOWN: 34,
		END: 35,
		HOME: 36,
		LEFT: 37,
		RIGHT: 39,
		OPEN_SUMMARY: 'alt+48', // Alt + 0
		PREV_SPACE: 'shift+32', // Shift + Space, for screen readers
	};

	/** Vendor prefixes for CSS3 animation events. **/
	var ANIMATION_PREFIXES = ['webkit', 'moz', 'MS', 'o', ''];

	/** Current preference values, seeded from PREFS then overridden by storage. **/
	var prefs = {};

	/** The settings dialog is always modal. **/
	var configIsModal = 1;

	/** Index of the visible slide, and the live slide collection. **/
	var current = 0;
	var slides = [];

	/** Progressive reveal of `.Cmasque` content inside the current slide. **/
	var reveal = {
		items: [],
		index: 0,
		active: 0,
	};

	/** Set when navigation was triggered from a dialog, to unfreeze the reveal. **/
	var resumeFromDialog = null;

	/** The open dialog, used for focus trapping and Esc. **/
	var openDial = null;

	/** Original window title, and the page url without its hash. **/
	var windowTitle = document.title;
	var baseUrl;

	window.onload = function () {
		initPrefs();
		buildSettingsDialog();
		loadSettings();
		buildNavBar();
		applyAccessibilityPrefs();
		initSlides();
		buildGotoSelect();
		bindEvents();
		saveCurrentOnUnload();
	};

	function initPrefs() {
		for (var i = 0; i < PREFS.length; i++) {
			prefs[PREFS[i].name] = PREFS[i].def;
		}
	}

	function applyAccessibilityPrefs() {
		if (prefs.VocalizeNdiapo === 1) {
			byId(ID.counter).setAttribute('aria-live', 'polite');
			byId(ID.counter).setAttribute('aria-atomic', 'false');
		}
		if (prefs.GotoBnext === 1) byId(ID.next).focus();
		for (var i = 0; i < SOUNDS.length; i++) {
			if (prefs[SOUNDS[i].pref] === 1) createAudio(SOUNDS[i]);
		}
	}

	function bindEvents() {
		bindPointer();
		bindKeyboard();
		bindControls();
		bindDialogs();
		prefixedEvent(byId(ID.flap), 'AnimationEnd', function () {
			byId(ID.flap).removeAttribute('class');
		});
	}

	function bindPointer() {
		if (prefs.ModePlan !== 0 || prefs.Noclick !== 0) return;
		document.addEventListener(
			'click',
			function () {
				if (!isInteractiveFocus()) gotoNext();
			},
			true
		);
	}

	function bindKeyboard() {
		document.addEventListener(
			'keydown',
			function (e) {
				var k = keyRef(e);
				if (k === KEY.OPEN_SUMMARY) openSummary();
				if (prefs.ModePlan !== 0) return;

				switch (k) {
					case KEY.SPACE:
						if (prefs.Noclick === 0) {
							gotoNext();
							e.preventDefault();
						}
						break;
					case KEY.RIGHT:
					case KEY.PAGE_DOWN:
						gotoNext();
						e.preventDefault();
						break;
					case KEY.LEFT:
					case KEY.PAGE_UP:
					case KEY.PREV_SPACE:
						gotoPrev();
						e.preventDefault();
						break;
					case KEY.HOME:
						current = 0;
						gotoSlide();
						e.preventDefault();
						break;
					case KEY.END:
						current = slides.length - 1;
						gotoSlide();
						e.preventDefault();
						break;
					case KEY.ENTER:
						if (!isInteractiveFocus()) {
							gotoNext();
							e.preventDefault();
						}
						break;
				}
			},
			false
		);
	}

	function bindControls() {
		byId(ID.next).addEventListener('click', gotoNext, false);
		byId(ID.prev).addEventListener('click', gotoPrev, false);
		byId(ID.summaryButton).addEventListener('click', openSummary, false);
		byId(ID.closeSummary).addEventListener('click', closeDialog, false);
		byId(ID.configButton).addEventListener('click', openSettings, false);
		byId(ID.closeConfig).addEventListener('click', closeDialog, false);
		byId(ID.save).addEventListener('click', saveSettings, false);
		byId(ID.reset).addEventListener('click', resetSettings, false);

		// The "go" button is only enabled once a slide number has been picked.
		byId(ID.gotoSelect).addEventListener(
			'change',
			function () {
				byId(ID.gotoButton).removeAttribute('disabled', 'disabled');
			},
			false
		);
		byId(ID.gotoButton).addEventListener(
			'blur',
			function () {
				byId(ID.gotoSelect).value = '';
				byId(ID.gotoButton).setAttribute('disabled', 'disabled');
			},
			false
		);
		byId(ID.gotoButton).addEventListener('click', gotoSelectedSlide, false);
	}

	function bindDialogs() {
		// Keep focus inside the open dialog.
		if (prefs.SumModOn === 1 || configIsModal === 1) {
			document.addEventListener(
				'focus',
				function (event) {
					if (openDial && !openDial.contains(event.target)) {
						event.stopPropagation();
						openDial.focus();
					}
				},
				true
			);
		}
		// Esc closes.
		document.addEventListener(
			'keydown',
			function (event) {
				if (openDial && keyRef(event) === KEY.ESC) {
					closeDialog();
					openDial = null;
				}
			},
			true
		);
	}

	function saveCurrentOnUnload() {
		window.onbeforeunload = function () {
			sessionStorage.setItem('Scurrent', current);
		};
	}

	function initSlides() {
		current = readCurrentSlide();
		slides = document.getElementsByClassName(CLS.slide);

		if (prefs.ModePlan === 0) hideAllSlides();
		setCounter(current + 1);
		if (prefs.VocalizeTitle === 1) announceTitle();
		byId(ID.counterTotal).firstChild.nodeValue = slides.length;
		slides[current].style.display = 'block';
		if (prefs.SoundSlide1 === 1 && current === 0) play('Sdiapo1');
		if (prefs.UpWindowTitle === 1) updateWindowTitle();

		if (prefs.ModePlan === 0) {
			document.body.style.height = '98.5%';
			byId(ID.screen).classList.remove(CLS.linearMode);
			updateBannerVisibility();
			applyEffect();
		} else {
			// Linear layout: everything is stacked, so no transition effect.
			byId(ID.screen).classList.add(CLS.linearMode);
			byId(ID.screen).setAttribute('data-effect', 'noEffect');
			addLinearIndexes();
		}
		buildSummary();
	}

	/** Restore the slide we were on before a reload, then clear the marker. **/
	function readCurrentSlide() {
		var saved = parseInt(sessionStorage.Scurrent, 10);
		sessionStorage.clear();
		return saved ? saved : 0;
	}

	function hideAllSlides() {
		var effect = currentEffect();
		for (var i = 0, len = slides.length; i < len; i++) {
			slides[i].style.display = 'none';
			removeEffectClass(slides[i], effect);
		}
		removeEffectClass(byId(ID.flap), effect);
	}

	function gotoNext() {
		if (reveal.active !== 0) {
			revealNextItem();
			return;
		}
		current += 1;
		if (current >= slides.length) current -= 1;
		showCurrent();
	}

	function gotoPrev() {
		// Going back cancels any reveal in progress on the current slide.
		resetReveal();
		current -= 1;
		if (current < 0) current = 0;
		showCurrent(true);
	}

	function gotoSlide() {
		if (reveal.active !== 0 && resumeFromDialog !== 1) {
			revealNextItem();
			return;
		}
		if (current >= slides.length) current = 0;
		showCurrent();
		resumeFromDialog = null;
	}

	/**
	 * Render the current slide.
	 * `showHidden` reveals every `.Cmasque` item at once, which is what going
	 * backwards does: the slide has already been walked through.
	 **/
	function showCurrent(showHidden) {
		hideAllSlides();
		if (slides[current]) slides[current].style.display = 'block';
		playSlideCues();
		updateBannerVisibility();
		applyEffect();
		setCounter(current + 1);
		rescaleSummary();
		if (prefs.VocalizeTitle === 1) announceTitle();
		initReveal(showHidden);
	}

	/** Hide the banner on "cover" slides, without taking it out of the DOM. **/
	function updateBannerVisibility() {
		var banner = byId(ID.banner);
		var main = byId(ID.main);
		var slide = slides[current];

		if (slide && slide.classList.contains(CLS.cover)) {
			banner.style.position = 'absolute';
			banner.style.top = '-10000px';
			main.removeAttribute('class', 'padding');
		} else {
			banner.style.position = 'relative';
			banner.style.top = '';
			main.setAttribute('class', 'padding');
		}
	}

	function setCounter(value) {
		byId(ID.counterCurrent).firstChild.nodeValue = value;
	}

	/** Number each slide in linear layout ("3 / 12"). **/
	function addLinearIndexes() {
		for (var i = 0, len = slides.length; i < len; i++) {
			var p = document.createElement('P');
			var span = document.createElement('SPAN');
			span.appendChild(document.createTextNode(i + 1 + ' / ' + len));
			p.appendChild(span);
			p.setAttribute('class', CLS.linearIndex);
			slides[i].setAttribute('id', 'D' + i);
			slides[i].appendChild(p);
		}
	}

	/**
	 * Collect the `.Cmasque` items of the current slide.
	 * Forward: hide them and lock navigation until they have all been shown.
	 * Backward (`showAll`): show them and leave navigation free.
	 **/
	function initReveal(showAll) {
		var candidates = slides[current].querySelectorAll('*');
		var items = [];

		for (var i = 0, len = candidates.length; i < len; i++) {
			if (candidates[i].classList.contains(CLS.hidden))
				items.push(candidates[i]);
		}
		if (items.length === 0) return;

		for (var j = 0; j < items.length; j++) {
			items[j].style.visibility = showAll ? 'visible' : 'hidden';
		}

		if (showAll) {
			resetReveal();
		} else {
			reveal.items = items;
			reveal.index = 0;
			reveal.active = 1;
		}
	}

	function revealNextItem() {
		if (reveal.items[reveal.index]) {
			reveal.items[reveal.index].style.visibility = 'visible';
		}
		if (prefs.SoundTxt === 1) play('Stexte');
		reveal.index += 1;
		if (reveal.index >= reveal.items.length) resetReveal();
	}

	function resetReveal() {
		reveal.items = [];
		reveal.index = 0;
		reveal.active = 0;
	}

	function currentEffect() {
		var name = byId(ID.screen).getAttribute('data-effect');
		return EFFECTS[name] || EFFECTS[DEFAULT_EFFECT];
	}

	function applyEffect() {
		var effect = currentEffect();
		if (effect.target === 'flap') {
			byId(ID.flap).classList.add(effect.className);
		} else if (effect.target === 'slide') {
			slides[current].classList.add(effect.className);
		}
		slides[current].style.opacity = '1';
	}

	function removeEffectClass(element, effect) {
		if (element && effect.className)
			element.classList.remove(effect.className);
	}

	function playSlideCues() {
		if (prefs.SoundSlide === 1 && current !== 0) play('Sdiapo');
		if (prefs.SoundSlide1 === 1 && current === 0) play('Sdiapo1');
		if (prefs.SoundSlideEnd === 1 && current === slides.length - 1)
			play('Sdiapoend');
		if (prefs.UpWindowTitle === 1) updateWindowTitle();
	}

	function play(soundId) {
		var element = byId(soundId);
		if (element) element.play();
	}

	function createAudio(sound) {
		var audio = document.createElement('AUDIO');
		audio.setAttribute('id', sound.id);
		audio.appendChild(audioSource(sound.file, 'mp3', 'audio/mp3'));
		audio.appendChild(audioSource(sound.file, 'ogg', 'audio/ogg'));
		byId(ID.audio).appendChild(audio);
	}

	function audioSource(file, extension, type) {
		var source = document.createElement('SOURCE');
		source.setAttribute('src', SOUND_PATH + file + '.' + extension);
		source.setAttribute('type', type);
		return source;
	}

	/** The slide heading, or its aria-label when it has none. **/
	function slideHeading() {
		return slides[current].childNodes[1];
	}

	/** Push the slide title into the live region. **/
	function announceTitle() {
		var live = byId(ID.liveTitle);
		var heading = slideHeading();
		live.innerHTML = '';
		if (heading && heading.tagName === 'H2') {
			live.innerHTML = heading.innerHTML;
		} else {
			live.appendChild(
				document.createTextNode(
					slides[current].getAttribute('aria-label')
				)
			);
		}
	}

	function updateWindowTitle() {
		var heading = slideHeading();
		var title;
		if (heading && heading.tagName === 'H2') {
			title = heading.innerText || heading.textContent;
		} else {
			title = slides[current].getAttribute('aria-label');
		}
		document.title = title + ' | ' + windowTitle;
	}

	/** Fill the navbar dropdown with one option per slide. **/
	function buildGotoSelect() {
		var select = byId(ID.gotoSelect);
		select.appendChild(option('', '-'));
		for (var i = 0, len = slides.length; i < len; i++) {
			select.appendChild(option(i, i + 1));
		}
	}

	function option(value, text) {
		var element = document.createElement('OPTION');
		element.setAttribute('value', value);
		element.appendChild(document.createTextNode(text));
		return element;
	}

	function gotoSelectedSlide() {
		var select = byId(ID.gotoSelect);
		if (parseInt(select.value, 10) > -1) {
			current = parseInt(select.value, 10);
			gotoSlide();
			resumeFromDialog = 1;
		} else {
			select.focus();
		}
	}

	/** Build the summary dialog: one button per slide heading. **/
	function buildSummary() {
		var summary = byId(ID.summary);
		var title = document.createElement('H1');
		title.setAttribute('id', ID.summaryTitle);
		title.setAttribute('class', CLS.blockTitle);
		title.appendChild(document.createTextNode(lang.SummaryTitle));
		title.appendChild(closeButton(ID.closeSummary));
		summary.appendChild(title);

		var list = document.createElement('OL');
		for (var i = 0, len = slides.length; i < len; i++) {
			var heading = slides[i].querySelector('h2');
			var text = heading
				? heading.innerText || heading.textContent
				: slides[i].getAttribute('aria-label');

			var button = document.createElement('BUTTON');
			button.setAttribute('type', 'button');
			button.setAttribute('data-slide', i);
			button.addEventListener('click', gotoSummarySlide, false);
			button.appendChild(document.createTextNode(text));

			var item = document.createElement('LI');
			item.appendChild(button);
			list.appendChild(item);
		}
		summary.appendChild(list);
	}

	function gotoSummarySlide() {
		var index = this.getAttribute('data-slide');
		current = parseInt(index, 10);
		if (prefs.SumModOn === 1) closeDialog();
		if (prefs.ModePlan === 0) {
			gotoSlide();
		} else {
			window.location.href = baseUrl + '#D' + index;
		}
		resumeFromDialog = 1;
	}

	function openSummary() {
		var summary = byId(ID.summary);
		if (prefs.SumModOn === 1) {
			summary.setAttribute('role', 'dialog');
			summary.setAttribute('aria-labelledby', ID.summaryTitle);
		} else if (prefs.ModePlan === 0) {
			// Inline: shrink the slide area to make room.
			byId(ID.wrapper).style.width = '75%';
			byId(ID.wrapper).style.fontSize = '80%';
		} else {
			byId(ID.wrapper).setAttribute('class', CLS.wrapperLeft);
		}
		summary.style.display = 'block';
		byId(ID.closeSummary).focus();
		openDial = summary;
		rescaleSummary();
	}

	function openSettings() {
		byId(ID.setting).style.display = 'block';
		byId(ID.closeConfig).focus();
		openDial = byId(ID.setting);
	}

	function closeDialog() {
		switch (openDial.getAttribute('id')) {
			case ID.summary:
				byId(ID.wrapper).removeAttribute('style');
				byId(ID.summary).style.display = 'none';
				byId(ID.summaryButton).focus();
				break;
			case ID.setting:
				byId(ID.setting).style.display = 'none';
				byId(ID.configButton).focus();
				break;
		}
		if (prefs.ModePlan === 1) byId(ID.wrapper).removeAttribute('class');
		openDial = null;
	}

	/** The first and last slides leave more room for the summary. **/
	function rescaleSummary() {
		var summary = byId(ID.summary);
		if (prefs.ModePlan !== 0) {
			summary.style.top = '0';
			summary.setAttribute('class', CLS.summaryFixed);
			return;
		}
		var isMiddleSlide = current > 0 && current + 1 < slides.length;
		summary.style.top = isMiddleSlide ? '10%' : '0';
		summary.style.height = isMiddleSlide ? '85%' : '95%';
	}

	function buildSettingsDialog() {
		var dialog = byId(ID.setting);

		var title = document.createElement('H1');
		title.setAttribute('id', ID.settingTitle);
		title.setAttribute('class', CLS.blockTitle);
		title.appendChild(document.createTextNode(lang.ConfigTitle));
		title.appendChild(closeButton(ID.closeConfig));
		dialog.setAttribute('aria-labelledby', ID.settingTitle);
		dialog.appendChild(title);

		var form = document.createElement('FORM');
		form.setAttribute('id', ID.formConfig);
		form.setAttribute('action', '');

		var groups = {
			Gaccess: fieldset(lang.Gaccess.legend),
			Gslide: fieldset(lang.Gslide.legend),
		};
		var effectsField = buildEffectsField();

		for (var i = 0; i < PREFS.length; i++) {
			appendPrefField(groups[PREFS[i].group], PREFS[i]);
		}

		form.appendChild(groups.Gaccess);
		form.appendChild(groups.Gslide);
		form.appendChild(effectsField);
		form.appendChild(buildFormButtons());
		dialog.appendChild(form);
	}

	function fieldset(legendText) {
		var element = document.createElement('FIELDSET');
		var legend = document.createElement('LEGEND');
		legend.appendChild(document.createTextNode(legendText));
		element.appendChild(legend);
		return element;
	}

	/** One checkbox + its help text, described by aria-describedby. **/
	function appendPrefField(parent, pref) {
		var input = document.createElement('INPUT');
		input.setAttribute('id', pref.name);
		input.setAttribute('aria-describedby', 'help-' + pref.name);
		input.setAttribute('type', 'checkbox');
		input.className = CLS.prefInput;

		var help = document.createElement('P');
		help.setAttribute('id', 'help-' + pref.name);
		help.setAttribute('class', CLS.prefHelp);
		help.appendChild(document.createTextNode(lang[pref.name].help));

		var label = document.createElement('LABEL');
		label.setAttribute('for', pref.name);
		label.className = pref.labelClass;
		label.appendChild(document.createTextNode(lang[pref.name].label));

		parent.appendChild(input);
		parent.appendChild(help);
		parent.appendChild(label);
		parent.appendChild(document.createElement('BR'));
	}

	function buildEffectsField() {
		var field = fieldset(lang.Geffects.legend);

		var label = document.createElement('LABEL');
		label.setAttribute('for', ID.effectSelect);
		label.appendChild(document.createTextNode(lang.LabelEffect));

		var select = document.createElement('SELECT');
		select.setAttribute('id', ID.effectSelect);
		for (var i = 0; i < EFFECT_ORDER.length; i++) {
			var name = EFFECT_ORDER[i];
			select.appendChild(option(name, lang[name].help));
		}

		field.appendChild(label);
		field.appendChild(document.createElement('BR'));
		field.appendChild(select);
		field.appendChild(document.createElement('BR'));
		return field;
	}

	function buildFormButtons() {
		var wrapper = document.createElement('DIV');
		wrapper.setAttribute('id', ID.configButtons);
		wrapper.setAttribute('class', CLS.configButtons);
		wrapper.appendChild(submitButton(ID.save, lang.Bsubmit));
		wrapper.appendChild(submitButton(ID.reset, lang.Bdefault));
		return wrapper;
	}

	/** Submit buttons on purpose: saving reloads the page to apply the effect. **/
	function submitButton(id, labels) {
		var button = document.createElement('INPUT');
		button.setAttribute('id', id);
		button.setAttribute('class', CLS.settingButton);
		button.setAttribute('type', 'submit');
		button.setAttribute('aria-label', labels.title);
		button.setAttribute('value', labels.value);
		return button;
	}

	function settingControls() {
		return document.querySelectorAll(
			'#setting fieldset input, #setting fieldset select'
		);
	}

	function eachSettingControl(callback) {
		var controls = settingControls();
		for (var i = 0, len = controls.length; i < len; i++) {
			callback(controls[i], controls[i].getAttribute('id'));
		}
	}

	function saveSettings() {
		eachSettingControl(function (control, id) {
			var value;
			if (control.nodeName === 'INPUT') {
				value = control.checked ? 1 : 0;
				prefs[id] = value;
			} else {
				// The effect is picked up by loadSettings() after the form reload.
				value = control.value;
			}
			localStorage.setItem(id, value);
		});
	}

	function resetSettings() {
		eachSettingControl(function (control, id) {
			localStorage.removeItem(id);
			if (control.nodeName === 'INPUT') {
				if (prefs[id] === 1) control.setAttribute('checked', 'checked');
			} else {
				control.value = DEFAULT_EFFECT;
			}
		});
	}

	function loadSettings() {
		var url = window.location.href;
		baseUrl = url.indexOf('#') > 0 ? url.slice(0, url.indexOf('#')) : url;
		byId(ID.formConfig).setAttribute('action', baseUrl);

		eachSettingControl(function (control, id) {
			var stored = localStorage.getItem(id);

			if (stored) {
				if (control.nodeName === 'INPUT') {
					if (parseInt(stored, 10) === 1)
						control.setAttribute('checked', 'checked');
					prefs[id] = parseInt(stored, 10);
				} else {
					byId(ID.screen).setAttribute('data-effect', stored);
				}
			}

			if (control.nodeName === 'INPUT') {
				if (prefs[id] > 0) control.setAttribute('checked', 'checked');
			} else {
				control.value = stored;
			}
		});
	}

	function buildNavBar() {
		var list = document.createElement('UL');
		list.setAttribute('id', ID.navbar);

		list.appendChild(
			listItem(iconButton(ID.prev, lang.Bprev.title, 'chevron-left'))
		);
		list.appendChild(listItem(buildGotoControl()));
		list.appendChild(
			listItem(iconButton(ID.next, lang.Bnext.title, 'chevron-right'))
		);
		list.appendChild(
			listItem(iconButton(ID.summaryButton, lang.Btoc.title, 'list'))
		);
		list.appendChild(buildCounter());
		list.appendChild(
			listItem(iconButton(ID.configButton, lang.Bconfig.title, 'gears'))
		);

		byId(ID.wrapperNav).appendChild(list);
	}

	/** Slide picker: a select plus the button that jumps to it. **/
	function buildGotoControl() {
		var wrapper = document.createElement('DIV');
		wrapper.setAttribute('id', ID.gotoWrapper);
		wrapper.className = CLS.gotoWrapper;

		var select = document.createElement('SELECT');
		select.setAttribute('id', ID.gotoSelect);
		select.setAttribute('aria-label', lang.Select.title);
		select.className = CLS.gotoSelect;

		wrapper.appendChild(select);
		wrapper.appendChild(
			iconButton(ID.gotoButton, lang.Bselect.title, 'angles-right')
		);
		return wrapper;
	}

	/** "3 of 12", with the middle word hidden from sight but read out loud. **/
	function buildCounter() {
		var item = document.createElement('LI');
		item.setAttribute('id', ID.counter);
		item.className = CLS.counter;

		var wrapper = document.createElement('DIV');
		wrapper.appendChild(
			counterPart(ID.counterCurrent, CLS.counterCurrent, '1')
		);
		wrapper.appendChild(counterPart(null, CLS.srOnly, lang.Ndxon));
		wrapper.appendChild(
			counterPart(ID.counterTotal, CLS.counterTotal, '999')
		);

		item.appendChild(wrapper);
		return item;
	}

	function counterPart(id, className, text) {
		var span = document.createElement('SPAN');
		if (id) span.setAttribute('id', id);
		span.className = className;
		span.appendChild(document.createTextNode(text));
		return span;
	}

	function iconButton(id, label, icon) {
		var button = document.createElement('BUTTON');
		button.setAttribute('type', 'button');
		button.setAttribute('id', id);
		button.setAttribute('aria-label', label);
		button.className = 'btn';
		button.appendChild(brandIcon(icon));
		return button;
	}

	function closeButton(id) {
		var button = document.createElement('BUTTON');
		button.setAttribute('type', 'button');
		button.setAttribute('id', id);
		button.className = CLS.closeButton;
		button.appendChild(brandIcon('xmark'));
		return button;
	}

	function listItem(child) {
		var item = document.createElement('LI');
		item.appendChild(child);
		return item;
	}

	function byId(id) {
		return document.getElementById(id);
	}

	function isInteractiveFocus() {
		return INTERACTIVE_TAGS.indexOf(document.activeElement.tagName) > -1;
	}

	/**
	 * Normalise a keydown into something comparable.
	 * Returns a number for a plain key, "alt+48" / "shift+32" for a modified
	 * one, and undefined for keys we do not handle.
	 **/
	function keyRef(event) {
		if (HANDLED_KEYCODES.indexOf(event.keyCode) < 0) return undefined;
		if (event.altKey) return 'alt+' + event.keyCode;
		if (event.shiftKey) return 'shift+' + event.keyCode;
		return event.keyCode;
	}

	/** Listen to a CSS3 animation event across vendor prefixes. **/
	function prefixedEvent(element, type, callback) {
		for (var i = 0; i < ANIMATION_PREFIXES.length; i++) {
			var eventName = ANIMATION_PREFIXES[i]
				? ANIMATION_PREFIXES[i] + type
				: type.toLowerCase();
			element.addEventListener(eventName, callback, false);
		}
	}
})();

function brandIcon(name, options) {
	options = options || {};
	var spritePath = options.spritePath || 'sprites/solid.svg';
	var className = options.className || '';

	var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	svg.setAttribute('aria-hidden', 'true');
	if (className) svg.setAttribute('class', className);

	var use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
	use.setAttribute('href', spritePath + '#' + name);
	svg.appendChild(use);

	return svg;
}
// @license-end
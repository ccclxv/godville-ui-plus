(function() {
'use strict';
try {

var doc = document;
var $id = function(id) {
	return doc.getElementById(id);
};
var $C = function(classname) {
	return doc.getElementsByClassName(classname);
};
var $c = function(classname) {
	return doc.getElementsByClassName(classname)[0];
};
var $Q = function(sel) {
	return doc.querySelectorAll(sel);
};
var $q = function(sel) {
	return doc.querySelector(sel);
};

var storage = {
	_get_key: function(key) {
		return "GUIp_" + god_name + ':' + key;
	},
	set: function(id, value) {
		localStorage[this._get_key(id)] = value;
		return value;
	},
	get: function(id) {
		return localStorage[this._get_key(id)];
	}
};

var i, len, follow_links, isFollowed, links_containers, temp, topic, unfollow_links,
	isTopic = location.pathname.match(/topic/) !== null,
	forum_topics = 'Forum' + (isTopic ? $q('.crumbs a:nth-child(3)').href.match(/forums\/show\/(\d+)/)[1]
									  : location.pathname.match(/forums\/show\/(\d+)/)[1]),
	god_name = localStorage.GUIp_CurrentUser,
	topics = JSON.parse(storage.get(forum_topics));

if (isTopic) {
	links_containers = $Q('#topic_mod');
} else {
	// add missing <small> elements
	temp = $Q('.c2');
	for (i = 0, len = temp.length; i < len; i++) {
		if (!temp[i].querySelector('small')) {
			temp[i].insertAdjacentHTML('beforeend', '<small />');
		}
	}

	links_containers = $Q('.c2 small');
}

// add links
for (i = 0, len = links_containers.length; i < len; i++) {
	topic = isTopic ? location.pathname.match(/\d+/)[0]
					: links_containers[i].parentElement.getElementsByTagName('a')[0].href.match(/\d+/)[0];
	isFollowed = topics[topic] !== undefined;
	links_containers[i].insertAdjacentHTML('beforeend',
		(isTopic ? '(' : '\n') + '<a class="follow" href="#" style="display: ' + (isFollowed ? 'none' : 'inline') + '">' + (isTopic ? window.GUIp_i18n.Subscribe : window.GUIp_i18n.subscribe) + '</a>' +
								 '<a class="unfollow" href="#" style="display: ' + (isFollowed ? 'inline' : 'none') + '">' + (isTopic ? window.GUIp_i18n.Unsubscribe : window.GUIp_i18n.unsubscribe) + '</a>' + (isTopic ? ')' : '')
	);
}

// add click events to follow links
follow_links = $Q('.follow');
var follow = function(e) {
	try {
		e.preventDefault();
		var topic = isTopic ? location.pathname.match(/\d+/)[0]
							: this.parentElement.parentElement.querySelector('a').href.match(/\d+/)[0],
			posts = isTopic ? +$c('subtitle').textContent.match(/\d+/)[0]
							: +this.parentElement.parentElement.nextElementSibling.textContent,
			topics = JSON.parse(storage.get(forum_topics));
		topics[topic] = posts;
		storage.set(forum_topics, JSON.stringify(topics));
		this.style.display = 'none';
		this.parentElement.querySelector('.unfollow').style.display = 'inline';
	} catch(error) {
		console.error(error);
	}
};
for (i = 0, len = follow_links.length; i < len; i++) {
	follow_links[i].onclick = follow;
}

// add click events to unfollow links
unfollow_links = $Q('.unfollow');
var unfollow = function(e) {
	try {
		e.preventDefault();
		var topic = isTopic ? location.pathname.match(/\d+/)[0]
							: this.parentElement.parentElement.querySelector('a').href.match(/\d+/)[0],
			topics = JSON.parse(storage.get(forum_topics));
		delete topics[topic];
		storage.set(forum_topics, JSON.stringify(topics));
		this.style.display = 'none';
		this.parentElement.querySelector('.follow').style.display = 'inline';
	} catch(error) {
		console.error(error);
	}
};
for (i = 0, len = unfollow_links.length; i < len; i++) {
	unfollow_links[i].onclick = unfollow;
}

// scroll to a certain post #
var guip_hash = location.hash.match(/#guip_(\d+)/);
if (guip_hash) {
	location.hash = $C('spacer')[+guip_hash[1]].id;
}

// formatting buttons
var $reply_form = $id('post_body_editor');
if ($reply_form) {
	window.GUIp_addGlobalStyleURL(window.GUIp_getResource('forum.css'), 'forum_css');
	var formatting_buttons =
		'<a class="formatting button bold" title="' + window.GUIp_i18n.bold_hint + '">' + window.GUIp_i18n.bold + '</a>' +
		'<a class="formatting button underline" title="' + window.GUIp_i18n.underline_hint + '">' + window.GUIp_i18n.underline + '</a>' +
		'<a class="formatting button strike" title="' + window.GUIp_i18n.strike_hint + '">' + window.GUIp_i18n.strike + '</a>' +
		'<a class="formatting button italic" title="' + window.GUIp_i18n.italic_hint + '">' + window.GUIp_i18n.italic + '</a>' +
		'<blockquote class="formatting bq" title="' + window.GUIp_i18n.quote_hint + '">bq.</blockquote>' +
		'<pre class="formatting bc" title="' + window.GUIp_i18n.code_hint + '"><code>bc.</code></pre>' +
		(window.GUIp_locale === 'ru' ? '<a class="formatting button godname" title="Вставить ссылку на бога"></a>' : '') +
		'<a class="formatting button link" title="' + window.GUIp_i18n.link_hint + '">a</a>' +
		'<a class="formatting button ul" title="' + window.GUIp_i18n.unordered_list_hint + '">•</a>' +
		'<a class="formatting button ol" title="' + window.GUIp_i18n.ordered_list_hint + '">1.</a>' +
		'<a class="formatting button br" title="' + window.GUIp_i18n.br_hint + '">\\n</a>' +
		'<a class="formatting button sup" title="' + window.GUIp_i18n.sup_hint + '">X<sup>2</sup></a>' +
		'<a class="formatting button sub" title="' + window.GUIp_i18n.sub_hint + '">X<sub>2</sub></a>' +
		'<a class="formatting button monospace" title="' + window.GUIp_i18n.monospace_hint + '"><code>' + window.GUIp_i18n.monospace + '</code></a>';
	$reply_form.insertAdjacentHTML('afterbegin', formatting_buttons);
	var val, ss, se, nls, nle, selection;
	var init = function(editor) {
		val = editor.value;
		ss = editor.selectionStart;
		se = editor.selectionEnd;
		selection = window.getSelection().isCollapsed ? '' : window.getSelection().toString().trim();
	};
	var putSelectionTo = function(editor, pos) {
		editor.focus();
		editor.selectionStart = editor.selectionEnd = pos + selection.length;
	};
	var basic_formatting = function(left, right, editor) {
		try {
			init(editor);
			while (ss < se && val[ss].match(/[^\wА-Яа-я]/)) {
				ss++;
			}
			while (ss < se && val[se - 1].match(/[^\wА-Яа-я]/)) {
				se--;
			}
			editor.value = val.slice(0, ss) + (val && val[ss - 1] && !val[ss - 1].match(/[^\wА-Яа-я]/) ? ' ' : '') + left + val.slice(ss, se) + selection + right + (val && val [se] && !val[se].match(/[^\wА-Яа-я]/) ? ' ' : '') + val.slice(se);
			putSelectionTo(editor, se + left.length);
			return false;
		} catch(error) {
			console.error(error);
		}
	};
	var quote_formatting = function(quotation, editor) {
		try {
			init(editor);
			nls = val && val[ss - 1] && !val[ss - 1].match(/\n/) ? '\n\n' : (val[ss - 2] && !val[ss - 2].match(/\n/) ? '\n' : '');
			nle = val && (val[se] && !val[se].match(/\n/) || !val[se]) ? '\n\n' : (val[se + 1] && !val[se + 1].match(/\n/) ? '\n' : '') +
			      selection && !selection[selection.length - 1].match(/\n/) ? '\n\n' : (selection[selection.length - 2] && !selection[selection.length - 2].match(/\n/) ? '\n' : '');
			editor.value = val.slice(0, ss) + nls + quotation + val.slice(ss, se) + selection + nle + val.slice(se);
			putSelectionTo(editor, se + quotation.length + nls.length + (se > ss || selection ? nle.length : 0));
		} catch(error) {
			console.error(error);
		}
	};
	var list_formatting = function(list_marker, editor) {
		try {
			init(editor);
			nls = val && val[ss - 1] && !val[ss - 1].match(/\n/) ? '\n' : '';
			nle = val && val[se] && !val[se].match(/\n/) ? '\n\n' : (val[se + 1] && !val[se + 1].match(/\n/) ? '\n' : '');
			var count = val.slice(ss, se).match(/\n/g) ? val.slice(ss, se).match(/\n/g).length + 1 : 1;
			editor.value = val.slice(0, ss) + nls + list_marker + ' ' + val.slice(ss, se).replace(/\n/g, '\n' + list_marker + ' ') + nle + val.slice(se);
			putSelectionTo(editor, se + nls.length + (list_marker.length + 1)*count);
		} catch(error) {
			console.error(error);
		}
	};
	var paste_br = function(editor) {
		try {
			init(editor);
			var pos = editor.selectionDirection === 'backward' ? ss : se;
			editor.value = val.slice(0, pos) + '<br>' + val.slice(pos);
			putSelectionTo(editor, pos + 4);
		} catch(error) {
			console.error(error);
		}
	};
	var set_click_actions = function(id, container) {
		temp = '#' + id + ' .formatting.';
		$q(temp + 'bold').onclick = basic_formatting.bind(this, '*', '*', container);
		$q(temp + 'underline').onclick = basic_formatting.bind(this, '+', '+', container);
		$q(temp + 'strike').onclick = basic_formatting.bind(this, '-', '-', container);
		$q(temp + 'italic').onclick = basic_formatting.bind(this, '_', '_', container);
		$q(temp + 'bq').onclick = quote_formatting.bind(this, 'bq. ', container);
		$q(temp + 'bc').onclick = quote_formatting.bind(this, 'bc. ', container);
		if (window.GUIp_locale === 'ru') {
			$q(temp + 'godname').onclick = basic_formatting.bind(this, '"', '":пс', container);
		}
		$q(temp + 'link').onclick = basic_formatting.bind(this, '"', '":', container);
		$q(temp + 'ul').onclick = list_formatting.bind(this, '*', container);
		$q(temp + 'ol').onclick = list_formatting.bind(this, '#', container);
		$q(temp + 'br').onclick = paste_br.bind(this, container);
		$q(temp + 'sup').onclick = basic_formatting.bind(this, '^', '^', container);
		$q(temp + 'sub').onclick = basic_formatting.bind(this, '~', '~', container);
		$q(temp + 'monospace').onclick = basic_formatting.bind(this, '@', '@', container);
	};
	set_click_actions('post_body_editor', $id('post_body'));
	
	var editFormObserver = new MutationObserver(function(mutations) {
		mutations.forEach(function() {
			if ($id('edit_body_editor') && !$q('#edit_body_editor .formatting.button.bold')) {
				$id('edit_body_editor').insertAdjacentHTML('afterbegin', formatting_buttons);
				set_click_actions('edit_body_editor', $id('edit_body'));
			}
		});
	});
	editFormObserver.observe($id('content'), { childList: true, subtree: true });
}

} catch(e) {
	console.error(e);
}
})();
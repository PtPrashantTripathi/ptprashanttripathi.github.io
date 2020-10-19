window.addEventListener('DOMContentLoaded', async function() {
	async function get(url) {
		const resp = await fetch(url);
		return resp.json();
	}

	const emojis = await get('https://api.github.com/emojis');
	const colors = await get('https://raw.githubusercontent.com/ozh/github-colors/master/colors.json');

	document.querySelectorAll('.repo-card').forEach(async function(el) {
		const name = el.getAttribute('data-repo');
		const img = await get(`http://url-metadata.herokuapp.com/api/metadata?url=https%3A%2F%2Fgithub.com%2F${name}`);
		const rdata = await get(`https://api.github.com/repos/${name}`);
		
		/* code for img withoud social banner*/
		if(img.data.image.trim() === "https://avatars3.githubusercontent.com/u/26687933?s=400&amp;v=4"){
			img.data.image = 'img/github_banner.jpg';
		}; 
		
		/* code for emoji*/
		rdata.description = (rdata.description || '').replace(/:\w+:/g, function(match) {
			const name = match.substring(1, match.length - 1);
			const emoji = emojis[name];

			if (emoji) {
				return `<span><img src="${emoji}" style="width: 1rem; height: 1rem; vertical-align: -0.2rem;"></span>`;
			}

			return match;
		});

		el.innerHTML = `
<div class="mdl-card__title pa-0">
	<span style="display: flex;">
			<img src="${img.data.image}"/>
	</span>
</div>
<div class="mdl-card__supporting-text relative">
	<span class="blog-cat"><div style="${rdata.language ? '' : 'display: none'}; margin-right: 16px;">
          <span style="width: 12px; height: 12px; border-radius: 100%; background-color: ${rdata.language ? colors[rdata.language].color : ''}; display: inline-block; top: 1px; position: relative;"></span>
          <span>${rdata.language}</span>
        </div>
		</span>
	<a href="${rdata.html_url}">
		<h4 class="mt-15 mb-20">${rdata.name}</h4>
	</a>
	<p>${rdata.description}</p>
	<a href="${rdata.html_url}" class="mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect bg-gray mdl-shadow--8dp" data-upgraded=",MaterialButton,MaterialRipple">
		<i class="zmdi zmdi-github-alt"></i>
	<span class="mdl-button__ripple-container"><span class="mdl-ripple"></span></span></a>
</div>
<div class="mdl-card__actions mdl-card--border">
	<span class="blog-post-date inline-block">${(rdata.created_at).split('T')[0]}</span>
	<div class="mdl-layout-spacer"></div>
	<div style="display: ${rdata.stargazers_count == 0 ? 'none' : 'flex'}; align-items: center; margin-right: 16px;">
          <svg style="fill: #586069;" aria-label="stars" viewBox="0 0 16 16" version="1.1" width="16" height="16" role="img"><path fill-rule="evenodd" d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25zm0 2.445L6.615 5.5a.75.75 0 01-.564.41l-3.097.45 2.24 2.184a.75.75 0 01.216.664l-.528 3.084 2.769-1.456a.75.75 0 01.698 0l2.77 1.456-.53-3.084a.75.75 0 01.216-.664l2.24-2.183-3.096-.45a.75.75 0 01-.564-.41L8 2.694v.001z"></path></svg>
          &nbsp; <span>${rdata.stargazers_count}</span>
    </div>
    <div style="display: ${rdata.forks == 0 ? 'none' : 'flex'}; align-items: center;">
          <svg style="fill: #586069;" aria-label="fork" viewBox="0 0 16 16" version="1.1" width="16" height="16" role="img"><path fill-rule="evenodd" d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z"></path></svg>
          &nbsp; <span>${rdata.forks}</span>
	</div>
	
</div>
	`;
	});
});
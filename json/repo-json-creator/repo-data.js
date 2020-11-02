window.addEventListener('DOMContentLoaded', async function() {
	async function get(url) {
		const resp = await fetch(url);
		return resp.json();
	}
	const colors = await get('https://raw.githubusercontent.com/ozh/github-colors/master/colors.json');
	const emojis = await get('https://api.github.com/emojis');
	
	document.querySelectorAll('.repo').forEach(async function(el) {
		const name = el.getAttribute('data-repo');
		console.log(name);
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
				return `<span><img src="${emoji}" loading="lazy" style="width: 1rem; height: 1rem; vertical-align: -0.2rem;"></span>`;
			}

			return match;
		});

		el.innerHTML =  `{
						<br>"name":"${rdata.name}",
						<br>"url":"${rdata.html_url}",
						<br>"description":"${rdata.description}",
						<br>"banner":"${img.data.image}",
						<br>"color":"${rdata.language ? colors[rdata.language].color : ''}",
						<br>"lang":"${rdata.language}",
						<br>"created_at":"${rdata.created_at}",
						<br>"view":"${rdata.stargazers_count}",
						<br>"forks":"${rdata.forks}"
						<br>}`;
	});
});
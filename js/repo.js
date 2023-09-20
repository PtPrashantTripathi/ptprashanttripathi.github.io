fetch("repos.json")
  .then((res) => res.json())
  .then((data) => {
    let output = "";
    data.forEach(function (repo) {
      output += `<!--repo card started--><div class="col-sm-4 mb-40"><div class="mdl-card mdl-shadow--2dp pa-0 repo-card"><div class="mdl-card__title pa-0"><img class="blog-img"loading="lazy"src="${
        repo.banner
      }"></div><div class="mdl-card__supporting-text relative"><span class="blog-cat"style="${
        repo.lang ? "" : "display: none"
      };"><span class="lang"style="background-color: ${
        repo.color
      };"></span><span>${repo.lang}</span></span><a href="${
        repo.url
      }"><h4 class="mt-15 mb-20">${repo.name}</h4></a><p>${
        repo.description
      }</p><a href="${
        repo.url
      }"class="mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect bg-gray mdl-shadow--8dp"data-upgraded="MaterialButton,MaterialRipple"><i class="zmdi zmdi-github-alt"></i><span class="mdl-button__ripple-container"><span class="mdl-ripple"></span></span></a></div><div class="mdl-card__actions mdl-card--border"><span class="blog-post-date inline-block">${
        repo.date.split("T")[0]
      }</span><div class="mdl-layout-spacer"></div><div class="mdl-card__actions"><img class="mr-5"src="img/star.svg"/><span>${
        repo.stars
      }</span><img class="mr-5 ml-5"src="img/fork.svg"/><span>${
        repo.forks
      }</span></div></div></div></div><!--repo card ended-->`;
    });
    document.getElementById("repo-card").innerHTML = output;
  });

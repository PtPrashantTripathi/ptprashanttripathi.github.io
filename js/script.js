fetch("data.json")
    .then(res => res.json())
    .then(d => {
        renderAbout(d.about);
        renderWhatIDo(d.whatIDo);
        renderExperience(d.experience);
        renderSkills(d.skills);
        renderCertifications(d.certifications);
        renderInterests(d.interests);
        renderRepos(d.repos);
        renderContact(d.contact);
        if (window.componentHandler) componentHandler.upgradeDom();
    });

function renderAbout(a) {
    const socialHTML = a.social
        .map(
            s =>
                `<li><a class="${s.class}" href="${s.url}"><i id="${s.id}" class="zmdi ${s.icon}"></i><div class="mdl-tooltip" data-mdl-for="${s.id}">${s.label}</div></a></li>`
        )
        .join("");

    const detailsHTML = a.details
        .map(
            d =>
                `<li><div class="profile-title">${d.emoji} ${d.label} :</div> ${d.value}</li>`
        )
        .join("");

    document.getElementById("about-social").innerHTML = socialHTML;
    document.getElementById("about-name").textContent = a.name;
    document.getElementById("about-tagline").textContent = a.tagline;
    document.getElementById("download_cv").href = a.resume;
    document.getElementById("about-img").src = a.avatar;
    document.getElementById("about-img").alt = a.name;
    document.getElementById("about-details").innerHTML = detailsHTML;
}

function renderWhatIDo(items) {
    document.getElementById("whatido-cards").innerHTML = items
        .map(
            item =>
                `<div class="col-md-4 col-xs-12 mb-30">
          <div class="mdl-card mdl-shadow--2dp text-center">
            <i class="zmdi ${item.icon} ${item.iconColor} profile-icon"></i>
            <h4 class="mb-15">${item.title}</h4>
            <p>${item.description}</p>
          </div>
        </div>`
        )
        .join("");
}

function renderExperience(items) {
    document.getElementById("experience-timeline").innerHTML = items
        .map(
            e =>
                `<div class="timeline-item">
          <div class="timeline-dot"></div>
          <div class="mdl-card exp-card">
            <div class="exp-company">
              ${e.company}${e.current ? '<span class="exp-badge ml-5">Current</span>' : ""}
            </div>
            <div class="exp-role">${e.role}</div>
            <div class="exp-meta">
              <span><i class="zmdi zmdi-pin"></i> ${e.location}</span>
              <span><i class="zmdi zmdi-calendar"></i> ${e.period}</span>
            </div>
            <p>${e.description}</p>
          </div>
        </div>`
        )
        .join("");
}

function renderSkills(groups) {
    const half = Math.ceil(groups.length / 2);
    const left = groups.slice(0, half);
    const right = groups.slice(half);

    function groupHTML(g) {
        return `<div class="skill-group mt-20">
      <span class="skill-group-label">${g.group}</span>
      <div class="chips">
        ${g.chips.map(c => `<span class="skill-chip">${c}</span>`).join("")}
      </div>
    </div>`;
    }

    document.getElementById("skills-left").innerHTML = left
        .map(groupHTML)
        .join("");
    document.getElementById("skills-right").innerHTML = right
        .map(groupHTML)
        .join("");
}

function renderCertifications(certs) {
    document.getElementById("certs-cards").innerHTML = certs
        .map(
            c =>
                `<div class="col-md-3 col-sm-6 col-xs-12 mb-30">
          <div class="mdl-card cert-card text-center">
            <i class="material-icons cert-icon">verified</i>
            <div class="cert-name">${c.name}</div>
            <div class="cert-meta">${c.issuer} &bull; ${c.date}</div>
          </div>
        </div>`
        )
        .join("");
}

function renderInterests(items) {
    document.getElementById("interests-grid").innerHTML = items
        .map(
            i =>
                `<div class="col-md-2 col-sm-4 col-xs-6 mb-30">
          <div class="mdl-card mdl-shadow--2dp text-center pa-20 pt-30 pb-30">
            <i class="zmdi ${i.icon}"></i>
            <span>${i.label}</span>
          </div>
        </div>`
        )
        .join("");
}

function renderContact(links) {
    document.getElementById("contact-icons").innerHTML = links
        .map(
            l =>
                `<li><a class="${l.class}" href="${l.url}"><i id="${l.id}" class="zmdi ${l.icon}" tabindex="0"></i><div class="mdl-tooltip" data-mdl-for="${l.id}">${l.label}</div></a></li>`
        )
        .join("");
}

function renderRepos(repos) {
    document.getElementById("repo-card").innerHTML = repos
        .map(repo => {
            const langStyle = repo.lang ? "" : "display: none";
            const repoDate = repo.date.split("T")[0];

            return `
        <!--repo card started-->
        <div class="col-sm-4 mb-40">
          <div class="mdl-card mdl-shadow--2dp pa-0 repo-card">
            <div class="mdl-card__title pa-0">
              <img class="blog-img" loading="lazy" src="${repo.banner}" />
            </div>
            <div class="mdl-card__supporting-text relative">
              <span class="blog-cat" style="${langStyle};">
                <span class="lang" style="background-color: ${repo.color};"></span>
                <span>${repo.lang}</span>
              </span>
              <a href="${repo.url}">
                <h4 class="mt-15 mb-20">${repo.name}</h4>
              </a>
              <p>${repo.description}</p>
              <a href="${repo.url}" class="mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect bg-gray mdl-shadow--8dp" data-upgraded="MaterialButton,MaterialRipple">
                <i class="zmdi zmdi-github-alt"></i>
                <span class="mdl-button__ripple-container">
                  <span class="mdl-ripple"></span>
                </span>
              </a>
            </div>
            <div class="mdl-card__actions mdl-card--border">
                <div class="mdl-card__actions">
                    <span class="blog-post-date inline-block">${repoDate}</span>
                    <div class="mdl-layout-spacer"></div>
                    <img class="mr-5" src="img/star.svg" />
                    <span>${repo.stars}</span>
                    <img class="mr-5 ml-5" src="img/fork.svg" />
                    <span>${repo.forks}</span>
                </div>
            </div>
          </div>
        </div>
        <!--repo card ended-->
      `;
        })
        .join("");
}

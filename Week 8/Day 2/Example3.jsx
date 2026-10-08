import data from './data.json'

export default function Example3() {
  return (
    <section className="data-card" aria-labelledby="experiences-heading">
      <h3 id="experiences-heading">Experiences</h3>
      {data.Experiences.map((experience) => (
        <div className="experience" key={experience.companyName}>
          <h4>
            <a href={experience.url} rel="noreferrer" target="_blank">
              {experience.companyName}
            </a>
          </h4>
          {experience.roles.map((role) => (
            <div className="experience-role" key={`${experience.companyName}-${role.title}`}>
              <p>
                <strong>{role.title}</strong>
              </p>
              <p>{role.description}</p>
              <p>
                {role.startDate} – {role.endDate} · {role.location}
              </p>
            </div>
          ))}
        </div>
      ))}
    </section>
  )
}

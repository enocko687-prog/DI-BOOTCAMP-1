import data from './data.json'

export default function Example2() {
  return (
    <section className="data-card" aria-labelledby="skills-heading">
      <h3 id="skills-heading">Skills</h3>
      {data.Skills.map((group) => (
        <div key={group.Area}>
          <h4>{group.Area}</h4>
          <ul>
            {group.SkillSet.map((skill) => (
              <li key={skill.Name}>
                {skill.Name}
                {skill.Hot && <span className="hot-skill"> · Hot</span>}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  )
}

import data from './data.json'

export default function Example1() {
  return (
    <section className="data-card" aria-labelledby="social-media-heading">
      <h3 id="social-media-heading">SocialMedias</h3>
      <ul>
        {data.SocialMedias.map((url) => (
          <li key={url}>
            <a href={url} rel="noreferrer" target="_blank">
              {url}
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}

import profileImage from '../assets/profile.svg';

const AboutPage = () => {
  return (
    <div className="page about-page">
      <header className="page-title-row">
        <div>
          <h1>About the Project</h1>
          <p>React + TypeScript project with Redux for viewing crypto information and reports.</p>
        </div>
      </header>

      <section className="about-content">
        <div className="about-card">
          <h2>What the project includes</h2>
          <p>
            The site shows the top 100 coins, supports search and tracking up to 5 selected coins with a switch,
            provides a realtime price report every second, and shows AI recommendations using AI agent by providing API key.
          </p>
        </div>

        <div className="about-card about-person">
          <img src={profileImage} alt="Profile image" className="profile-image" />
          <div>
            <h2>Developer</h2>
            <p>Name: [Matan Arazi]</p>
            <p>Course: Full Stack Web Developer</p>
            <p>Tools: React, TypeScript, Redux, Vite</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;

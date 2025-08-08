import Image from "next/image";

type TeamMember = {
  name: string;
  roles: string[];
  email: string;
  image: string;
  bio: string;
};

const team: TeamMember[] = [
  {
    name: "Stella Parker",
    roles: ["Team Lead", "Backend Lead", "GitHub Master"],
    email: "sparker11@sfsu.edu",
    image: "/team/myface.jpg",
    bio: "CS Undergraduate at SFSU",
  },
  {
    name: "El Julianna Embalzado",
    roles: ["Software Architect"],
    email: "eembalzado@mail.sfsu.edu",
    image: "/team/EL.JPG",
    bio: "An aspiring software architect and a senior at SFSU pursuing a degree in Computer Science.",
  },
  {
    name: "Nathaniel Moreno",
    roles: ["Database Administrator"],
    email: "nmoreno@sfsu.edu",
    image: "/team/Team_PIC_NM.png",
    bio: "I am a student attending SFSU, very interested in programming and passionate about the studies of it as well!",
  },
  {
    name: "Krishna Shenoy",
    roles: ["Technical Writer"],
    email: "920875953@sfsu.edu",
    image: "/team/IMG_0440.jpg",
    bio: "Krishna Shenoy is a Senior at San Francisco State University majoring in Computer Science",
  },
  {
    name: "Juan Daniel Ramirez",
    roles: ["Frontend Lead"],
    email: "jramirez9@sfsu.edu",
    image: "/team/photo.png",
    bio: "Juan Ramirez is a Senior in San Francisco University, who majors in Computer Science. He also has a minor in Video Game Studies",
  },
  {
    name: "Fatma Almosawi",
    roles: ["Scrum Master"],
    email: "falmosawi@sfsu.edu",
    image: "/team/fatma.png",
    bio: "Fatma is a senior studying Computer SFSU with an interest in software engineering.",
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Section: Mission Statement */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-indigo-600/5"></div>
        <div className="absolute w-32 h-32 rounded-full top-20 left-10 bg-blue-400/10 blur-xl animate-float"></div>
        <div
          className="absolute w-48 h-48 rounded-full bottom-20 right-10 bg-purple-400/10 blur-xl animate-float"
          style={{ animationDelay: "1s" }}
        ></div>

        <div className="relative max-w-6xl px-8 mx-auto">
          <div className="max-w-4xl mx-auto text-center animate-slide-up">
            <div className="inline-flex items-center px-4 py-2 mb-8 border rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-200/50">
              <div className="w-2 h-2 mr-3 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-slate-600">
                Our Purpose
              </span>
            </div>

            <h1 className="mb-8 text-5xl font-bold leading-tight text-transparent md:text-7xl bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 bg-clip-text">
              Mission Statement
            </h1>

            <p className="text-xl font-light leading-relaxed md:text-2xl text-slate-600">
              We're a passionate group committed to building a platform that
              connects parking space owners with drivers, making city parking
              easier and more accessible.
            </p>
          </div>
        </div>
      </section>

      {/* Section: Team Members */}
      <section className="relative py-24">
        <div className="px-8 mx-auto max-w-7xl">
          <div className="mb-20 text-center animate-slide-up">
            <div className="inline-flex items-center px-4 py-2 mb-6 border rounded-full bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border-emerald-200/50">
              <div className="w-2 h-2 mr-3 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-sm font-medium text-slate-600">Team</span>
            </div>

            <h2 className="mb-6 text-4xl font-bold text-transparent md:text-5xl bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 bg-clip-text">
              The Creators
            </h2>

            <p className="max-w-3xl mx-auto text-lg leading-relaxed text-slate-600">
              We're a passionate group of engineers and designers committed to
              solving real urban challenges through innovative technology.
            </p>
          </div>

          {/* Grid for Team Member Cards */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {team.map(({ name, roles, email, image, bio }, index) => (
              <div
                key={email}
                className="relative group animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Background blur effect on hover */}
                <div className="absolute transition-all duration-500 opacity-0 -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl blur group-hover:opacity-20"></div>

                {/* Main card content */}
                <div className="relative p-8 transition-all duration-500 border bg-white/80 backdrop-blur-sm rounded-2xl border-slate-200/50 hover:border-slate-300/50 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2">
                  {/* Image Section */}
                  <div className="relative mb-6">
                    <div className="relative mx-auto w-28 h-28">
                      {/* Spinning gradient border on hover */}
                      <div className="absolute transition-all duration-500 rounded-full opacity-0 -inset-2 bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 group-hover:opacity-100 animate-spin-slow"></div>

                      <div className="relative w-full h-full overflow-hidden transition-transform duration-500 border-2 border-white rounded-full shadow-lg group-hover:scale-110">
                        <Image
                          src={image}
                          alt={name}
                          fill
                          className={`object-cover ${name === "Krishna Shenoy" ? "scale-99" : ""} group-hover:scale-105 transition-transform duration-700`}
                          priority
                        />
                      </div>

                      <div className="absolute flex items-center justify-center w-6 h-6 border-2 border-white rounded-full -bottom-1 -right-1 bg-emerald-400">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    </div>
                  </div>

                  {/* Text content */}
                  <div className="space-y-4 text-center">
                    <div>
                      <h3 className="text-xl font-semibold transition-colors duration-300 text-slate-900 group-hover:text-blue-600">
                        {name}
                      </h3>
                      <p className="text-sm font-medium text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
                        {roles.join(" • ")}
                      </p>
                    </div>

                    <p className="text-sm leading-relaxed transition-colors duration-300 text-slate-600 group-hover:text-slate-700">
                      {bio}
                    </p>

                    <div className="pt-4">
                      <a
                        href={`mailto:${email}`}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium transition-all duration-300 border bg-gradient-to-r from-slate-100 to-slate-200 hover:from-blue-50 hover:to-purple-50 border-slate-200 hover:border-blue-200 rounded-xl text-slate-700 hover:text-blue-600 group/btn"
                      >
                        <svg
                          className="w-4 h-4 mr-2 transition-transform duration-300 group-hover/btn:scale-110"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                        <span className="group-hover/btn:animate-shimmer">
                          Email
                        </span>
                      </a>
                    </div>
                  </div>

                  {/* Decorative elements */}
                  <div className="absolute w-8 h-8 transition-all duration-500 rounded-full opacity-0 top-4 right-4 bg-gradient-to-br from-blue-400/20 to-purple-400/20 group-hover:opacity-100 group-hover:rotate-45"></div>
                  <div
                    className="absolute w-6 h-6 transition-all duration-700 rounded-full opacity-0 bottom-4 left-4 bg-gradient-to-br from-emerald-400/20 to-blue-400/20 group-hover:opacity-100"
                    style={{ transitionDelay: "0.1s" }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Floating Action Button to scroll up */}
      <div className="fixed z-10 bottom-8 right-8">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-20"></div>
          {/* A link to scroll to the top of the page */}
          <a
            href="#"
            className="relative flex items-center justify-center transition-all duration-300 rounded-full shadow-lg cursor-pointer w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-xl hover:scale-110 group"
          >
            <svg
              className="w-6 h-6 text-white transition-transform duration-300 group-hover:-translate-y-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 15l7-7 7 7"
              />
            </svg>
          </a>
        </div>
      </div>

      {/* Background Gradient Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute left-0 rounded-full top-1/4 w-96 h-96 bg-gradient-to-r from-blue-300/5 to-purple-300/5 blur-3xl"></div>
        <div className="absolute right-0 rounded-full bottom-1/4 w-96 h-96 bg-gradient-to-r from-purple-300/5 to-indigo-300/5 blur-3xl"></div>
      </div>
    </div>
  );
}

import projects from '../data/projects'

export default function Projects(){
    return (
        <div className="container py-4">
            <h2>Projects</h2>
            <div className="row">
                {projects.map(p=> (
                    <div className="col-md-6" key={p.id}>
                        <div className="card mb-3">
                            <div className="card-body">
                                <h5 className="card-title">{p.title}</h5>
                                <p className="card-text">{p.description}</p>
                                <p className="card-text"><small className="text-muted">Tech: {p.tech.join(', ')}</small></p>
                                <a className="btn btn-sm btn-outline-primary" href={p.link}>View</a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

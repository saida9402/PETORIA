const BRANDS = [
  {icon:'👑',name:'Royal Canin'},{icon:'⛰️',name:"Hill's"},
  {icon:'🌿',name:'Orijen'},{icon:'🔬',name:'Purina Pro'},
  {icon:'🦴',name:'Kong'},{icon:'💫',name:'Frontline'},
  {icon:'🌱',name:'Acana'},{icon:'🏆',name:'Pedigree'},
];
export default function BrandsStrip() {
  return (
    <section className="brands-strip">
      <div className="wrap">
        <p className="brands-strip__title">Trusted premium brands</p>
        <div className="brands-strip__logos">
          {BRANDS.map(b => (
            <div key={b.name} className="brands-strip__logo">
              <span className="brands-strip__logo-icon">{b.icon}</span>
              <span className="brands-strip__logo-name">{b.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

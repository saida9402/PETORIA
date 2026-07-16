import Link from 'next/link';
import StadiumIcon from '@mui/icons-material/Stadium';
import VaccinesIcon from '@mui/icons-material/Vaccines';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PlaceIcon from '@mui/icons-material/Place';

const EVENT_ICON_SX = { fontSize: 32, color: 'common.white' } as const;
const META_ICON_SX = { fontSize: 'inherit', verticalAlign: 'middle', marginRight: '4px' } as const;

const EVENTS = [
  {
    id: 'e1',
    title:    'Seoul Pet Expo 2025',
    date:     'Jun 14–16, 2025',
    location: 'COEX Convention Center, Gangnam',
    desc:     'Korea\'s biggest annual pet expo. 300+ brands, live demos, vet Q&A sessions.',
    badge:    'Upcoming',
    badgeClass: 'badge--blue',
    icon:     <StadiumIcon sx={EVENT_ICON_SX} />,
    color:    'linear-gradient(135deg, var(--g800), var(--g600))',
  },
  {
    id: 'e2',
    title:    'Free Vaccination Drive',
    date:     'Jun 20, 2025',
    location: 'Petoria Flagship Store, Teheran-ro',
    desc:     'Bring your dog or cat for free core vaccinations. Sponsored by Petoria & Green Paws Vet.',
    badge:    'Free',
    badgeClass: 'badge--new',
    icon:     <VaccinesIcon sx={EVENT_ICON_SX} />,
    color:    'linear-gradient(135deg, var(--teal), #059669)',
  },
  {
    id: 'e3',
    title:    'Pet Photography Workshop',
    date:     'Jul 5, 2025',
    location: 'Insadong Community Hall, Jongno',
    desc:     'Learn to photograph your pet like a pro. Session includes 1-on-1 coaching + treats!',
    badge:    'Limited seats',
    badgeClass: 'badge--amber',
    icon:     <PhotoCameraIcon sx={EVENT_ICON_SX} />,
    color:    'linear-gradient(135deg, var(--amber), #d97706)',
  },
  {
    id: 'e4',
    title:    'Petoria Summer Sale',
    date:     'Jul 15–31, 2025',
    location: 'Online — petoria.com + all stores',
    desc:     'Up to 40% off on premium food, accessories and toys. Members get early access.',
    badge:    'Sale',
    badgeClass: 'badge--sale',
    icon:     <ShoppingBagIcon sx={EVENT_ICON_SX} />,
    color:    'linear-gradient(135deg, var(--rose), #e11d48)',
  },
];

export default function Events() {
  return (
    <section className="events">
      <div className="wrap">
        <div className="section-hd">
          <div>
            <p className="section-hd__eyebrow">What's on</p>
            <h2 className="section-hd__title">Upcoming Events</h2>
            <p className="section-hd__sub">Pet expos, free vet sessions and community meetups</p>
          </div>
          <Link href="/cs" className="section-hd__link">View all →</Link>
        </div>

        <div className="events__grid">
          {EVENTS.map(ev => (
            <div key={ev.id} className="event-card">
              {/* Color header */}
              <div className="event-card__header" style={{ background: ev.color }}>
                <span className="event-card__icon">{ev.icon}</span>
                <span className={`badge ${ev.badgeClass}`}>{ev.badge}</span>
              </div>

              {/* Body */}
              <div className="event-card__body">
                <p className="event-card__date"><CalendarTodayIcon sx={META_ICON_SX} />{ev.date}</p>
                <h3 className="event-card__title">{ev.title}</h3>
                <p className="event-card__location"><PlaceIcon sx={META_ICON_SX} />{ev.location}</p>
                <p className="event-card__desc">{ev.desc}</p>
              </div>

              {/* Footer */}
              <div className="event-card__footer">
                <Link href="/cs" className="btn btn--outline btn--sm">
                  Learn more →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

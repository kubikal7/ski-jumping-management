CREATE TYPE public.event_type AS ENUM (
    'TRAINING',
    'COMPETITION',
    'CAMP'
);


--
-- Name: severity_level; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.severity_level AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH'
);


--
-- Name: user_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_role AS ENUM (
    'TRAINER',
    'ATHLETE',
    'OPERATE',
    'ADMIN'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: event_allowed_team; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.event_allowed_team (
    event_id integer NOT NULL,
    team_id integer NOT NULL
);


--
-- Name: event_participants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.event_participants (
    id integer NOT NULL,
    event_id integer NOT NULL,
    athlete_id integer NOT NULL,
    note text
);


--
-- Name: event_participants_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.event_participants ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.event_participants_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.events (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    type character varying(50) NOT NULL,
    hill_id integer NOT NULL,
    start_date timestamp without time zone NOT NULL,
    end_date timestamp without time zone NOT NULL,
    description text,
    created_by integer,
    level smallint NOT NULL,
    CONSTRAINT events_level_check CHECK (((level >= 1) AND (level <= 5)))
);


--
-- Name: events_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.events ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.events_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: hills; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.hills (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    city character varying(50),
    country character varying(50),
    hill_size smallint,
    k_point smallint,
    latitude numeric(9,6),
    longitude numeric(9,6)
);


--
-- Name: hills_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.hills ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.hills_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: injuries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.injuries (
    id integer NOT NULL,
    athlete_id integer NOT NULL,
    injury_date date,
    recovery_date date,
    severity character varying(10),
    description text
);


--
-- Name: injuries_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.injuries ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.injuries_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: results; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.results (
    id integer NOT NULL,
    event_id integer,
    athlete_id integer,
    season character varying(9) NOT NULL,
    attempt_number smallint,
    jump_length numeric(4,1),
    style_points numeric(3,1),
    wind_compensation numeric(3,1),
    gate smallint,
    total_points numeric(5,1),
    coach_comment text,
    video_url character varying(255),
    speed_takeoff numeric(4,1),
    flight_time numeric(3,1)
)
PARTITION BY LIST (season);


--
-- Name: results_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.results_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: results_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.results_id_seq OWNED BY public.results.id;


--
-- Name: results_2025_2026; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.results_2025_2026 (
    id integer DEFAULT nextval('public.results_id_seq'::regclass) CONSTRAINT results_id_not_null NOT NULL,
    event_id integer,
    athlete_id integer,
    season character varying(9) CONSTRAINT results_season_not_null NOT NULL,
    attempt_number smallint,
    jump_length numeric(4,1),
    style_points numeric(3,1),
    wind_compensation numeric(3,1),
    gate smallint,
    total_points numeric(5,1),
    coach_comment text,
    video_url character varying(255),
    speed_takeoff numeric(4,1),
    flight_time numeric(3,1)
);


--
-- Name: results_2026_2027; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.results_2026_2027 (
    id integer DEFAULT nextval('public.results_id_seq'::regclass) CONSTRAINT results_id_not_null NOT NULL,
    event_id integer,
    athlete_id integer,
    season character varying(9) CONSTRAINT results_season_not_null NOT NULL,
    attempt_number smallint,
    jump_length numeric(4,1),
    style_points numeric(3,1),
    wind_compensation numeric(3,1),
    gate smallint,
    total_points numeric(5,1),
    coach_comment text,
    video_url character varying(255),
    speed_takeoff numeric(4,1),
    flight_time numeric(3,1)
);


--
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    name character varying(50) NOT NULL
);


--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.roles ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.roles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: teams; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.teams (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: teams_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.teams ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.teams_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    user_id integer NOT NULL,
    role_id integer NOT NULL
);


--
-- Name: user_teams; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_teams (
    user_id integer NOT NULL,
    team_id integer NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    first_name character varying(50) NOT NULL,
    last_name character varying(50) NOT NULL,
    login character varying(50) CONSTRAINT users_email_not_null NOT NULL,
    password_hash character varying(255) NOT NULL,
    birth_date date,
    nationality character varying(50),
    photo_url character varying(255),
    weight numeric(5,2),
    height numeric(5,2),
    active boolean DEFAULT true,
    last_login timestamp without time zone,
    must_change_password boolean DEFAULT true
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.users ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: results_2025_2026; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.results ATTACH PARTITION public.results_2025_2026 FOR VALUES IN ('2025/2026');


--
-- Name: results_2026_2027; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.results ATTACH PARTITION public.results_2026_2027 FOR VALUES IN ('2026/2027');


--
-- Name: results id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.results ALTER COLUMN id SET DEFAULT nextval('public.results_id_seq'::regclass);


--
-- Data for Name: event_allowed_team; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.event_allowed_team (event_id, team_id) FROM stdin;
7	9
7	10
8	9
10	9
11	10
13	10
14	11
15	12
16	9
17	11
17	12
17	9
17	10
18	11
18	12
19	9
12	9
\.


--
-- Data for Name: event_participants; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.event_participants (id, event_id, athlete_id, note) FROM stdin;
23	7	47	\N
24	7	28	\N
25	7	29	\N
26	7	31	\N
27	7	26	\N
28	7	25	\N
29	7	53	\N
30	7	39	\N
31	7	30	\N
32	7	34	\N
33	7	35	\N
34	7	27	\N
35	16	28	\N
36	16	31	\N
37	16	25	\N
38	16	29	\N
\.


--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.events (id, name, type, hill_id, start_date, end_date, description, created_by, level) FROM stdin;
7	Trening w Zakopanem	TRAINING	26	2025-11-15 10:00:00	2025-11-15 14:00:00	Trening dla kadr narodowych	\N	1
8	Puchar Świata Lillehammer	COMPETITION	30	2025-11-21 17:00:00	2025-11-23 15:30:00		\N	5
10	Puchar Świata Harrachov	COMPETITION	29	2025-11-28 16:00:00	2025-11-30 17:00:00		\N	5
11	Trening w Szczyrku	TRAINING	28	2025-11-11 13:00:00	2025-11-11 17:00:00		\N	1
13	Puchar Kontynentalny Lahti	TRAINING	35	2025-11-22 13:00:00	2025-11-23 17:00:00		\N	4
14	Trening w Wiśle	TRAINING	27	2025-11-19 13:00:00	2025-11-19 17:00:00		\N	1
15	Trening w Zakopanem	TRAINING	26	2025-11-19 13:00:00	2025-11-19 17:00:00		\N	1
16	Obóz w Engelbergu	CAMP	32	2025-11-01 09:00:00	2025-11-11 12:00:00		\N	1
17	Mistrzostwa Polski	COMPETITION	26	2025-11-26 09:00:00	2025-11-26 12:00:00		\N	3
18	Lokalne zawody	COMPETITION	28	2025-11-13 09:00:00	2025-11-13 12:00:00		\N	2
19	Trening w Szczyrku 1	TRAINING	28	2025-11-12 11:00:00	2025-11-12 13:00:00		\N	1
12	Trening w Szczyrku 2	TRAINING	28	2025-11-12 13:00:00	2025-11-12 17:00:00		\N	1
\.


--
-- Data for Name: hills; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.hills (id, name, city, country, hill_size, k_point, latitude, longitude) FROM stdin;
24	Skocznia im. skoczków pilskich	Piła	Polska	100	90	53.151802	16.784599
26	Wielka Krokiew	Zakopane	Polska	140	125	49.280236	19.964218
27	Skocznia im. Adama Małysza	Wisła	Polska	140	125	49.648403	18.867989
28	Skalite	Szczyrk	Polska	90	85	49.715823	19.024887
29	Certak	Harrachov	Czechy	95	90	50.768684	15.431972
30	Lysgårdsbakken	Lillehammer	Norwegia	140	123	61.354614	10.272217
31	Bloudkova velikanka	Planica	Słowenia	138	125	45.845064	13.600044
32	Gross-Titlis-Schanze	Engelberg	Szwajcaria	140	125	46.815099	9.953613
33	Bergisel	Innsbruck	Austria	128	120	47.254301	11.399002
34	Holmenkollbakken	Oslo	Norwegia	134	120	59.909599	10.737762
35	Salpausselkä	Lahti	Finlandia	130	116	60.978437	25.661316
36	Kulm	Kulm	Austria	235	200	46.890232	10.546875
\.


--
-- Data for Name: injuries; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.injuries (id, athlete_id, injury_date, recovery_date, severity, description) FROM stdin;
6	29	2025-11-01	2025-11-05	MEDIUM	Stłuczenie biodra
7	27	2025-10-17	2025-11-30	LOW	Kontuzja nogi
8	31	2025-05-10	2025-07-31	HIGH	Kontuzja barku
9	29	2025-04-17	2025-05-15	MEDIUM	Kontuzja stopy
10	46	2025-11-06	\N	MEDIUM	Kontuzja ręki
11	36	2024-06-12	2024-07-11	MEDIUM	Kontuzja stopy
12	48	2025-11-02	2025-11-03	LOW	Stłuczenie
13	42	2025-07-09	2025-07-31	LOW	Stłuczenie
14	37	2025-03-01	2025-04-27	MEDIUM	Kontuzja stopy
15	36	2025-11-01	2025-11-05	LOW	Stłuczenie
16	45	2025-10-18	\N	HIGH	Kontuzja kręgosłupa
17	35	2025-01-11	2025-01-23	LOW	Stłuczenie
\.


--
-- Data for Name: results_2025_2026; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.results_2025_2026 (id, event_id, athlete_id, season, attempt_number, jump_length, style_points, wind_compensation, gate, total_points, coach_comment, video_url, speed_takeoff, flight_time) FROM stdin;
23	7	47	2025/2026	1	125.0	\N	\N	4	\N	Sztywniej na progu	https://www.youtube.com/shorts/enOAIY7XCQg	90.1	5.3
24	7	47	2025/2026	2	133.0	\N	\N	4	\N			90.5	5.3
25	7	28	2025/2026	1	120.0	\N	\N	4	\N	Słabe warunki		89.5	4.5
26	7	28	2025/2026	2	130.0	\N	\N	6	\N	Podobny skok do pierwszego		90.5	5.0
28	7	29	2025/2026	2	125.0	\N	\N	5	\N	Spóźniony skok na progu		90.6	5.1
27	7	29	2025/2026	1	132.5	\N	\N	5	\N	Dobry skok		91.1	5.2
29	7	31	2025/2026	1	121.0	\N	\N	5	\N			90.2	5.1
30	7	31	2025/2026	2	120.5	\N	\N	5	\N			90.1	5.0
31	7	28	2025/2026	3	126.0	\N	\N	5	\N			90.4	4.5
33	7	29	2025/2026	3	121.0	\N	\N	4	\N			90.1	5.7
32	7	29	2025/2026	3	138.0	\N	\N	7	\N			92.3	5.6
34	7	28	2025/2026	4	138.0	\N	\N	7	\N			92.3	5.6
35	7	28	2025/2026	4	100.0	\N	\N	\N	\N			\N	\N
36	16	28	2025/2026	1	126.0	\N	\N	8	\N			88.9	4.8
37	16	28	2025/2026	2	118.0	\N	\N	4	\N			87.1	4.7
38	16	28	2025/2026	3	131.0	\N	\N	7	\N			89.0	5.0
39	16	29	2025/2026	1	121.0	\N	\N	5	\N			89.5	5.0
40	16	29	2025/2026	2	134.0	\N	\N	6	\N			89.7	5.2
41	16	29	2025/2026	3	140.0	\N	\N	6	\N			90.1	5.8
\.


--
-- Data for Name: results_2026_2027; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.results_2026_2027 (id, event_id, athlete_id, season, attempt_number, jump_length, style_points, wind_compensation, gate, total_points, coach_comment, video_url, speed_takeoff, flight_time) FROM stdin;
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.roles (id, name) FROM stdin;
1	ADMIN
2	MANAGER
3	OPERATE
4	TRAINER
5	ATHLETE
6	INJURY_MANAGER
\.


--
-- Data for Name: teams; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.teams (id, name, description, created_at) FROM stdin;
9	Kadra A	Kadra przeznaczona dla najlepszych zawodników	2025-11-17 20:12:49.44186
10	Kadra B	Rezerwy kadry A	2025-11-17 20:13:01.653812
11	KS Wisła	Lokalna drużyna z Wisły	2025-11-17 20:13:56.640997
12	KS Zakopane	Lokalna drużyna z Zakopanego	2025-11-17 20:14:08.777657
\.


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_roles (user_id, role_id) FROM stdin;
37	5
38	3
43	5
42	5
46	5
49	2
50	2
56	2
56	3
2	1
25	5
26	5
36	5
39	5
48	5
45	5
44	5
33	5
29	5
32	1
28	5
31	5
53	5
30	5
34	5
35	5
27	5
40	4
41	4
51	4
52	4
55	6
54	6
47	5
47	4
\.


--
-- Data for Name: user_teams; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_teams (user_id, team_id) FROM stdin;
25	12
25	9
26	11
26	9
36	11
39	12
39	10
48	11
45	11
44	11
33	12
29	11
29	9
28	12
28	9
31	11
31	9
53	12
53	10
30	11
30	10
34	12
34	10
35	11
35	10
27	11
27	10
40	9
41	10
51	11
52	12
55	12
55	9
54	11
54	10
47	12
47	9
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, first_name, last_name, login, password_hash, birth_date, nationality, photo_url, weight, height, active, last_login, must_change_password) FROM stdin;
43	Rafał	Kiełbasa	rafal.kielbasa	$2a$10$phr4SmoD.E2UBQFj29IwZukRcl22DB2eHYpL4T9RJXcbmQZoFesNm	1996-11-08	Polska		60.00	173.00	t	\N	t
25	Kamil	Zjazd	kamil.zjazd	$2a$10$Qm1pD2ruFEdnPjng21G.W.2rkaQp4BqZ14PZg96kZaGNGwW5U7/1y	1987-05-25	Polska		58.00	173.00	t	\N	t
26	Piotr	Tętnica	piotr.tetnica	$2a$10$SS7pxhiSyC5cnyCuZEKtju.6ggN5iV350.D50KiInuijzxhgJItq6	1987-01-16	Polska		59.00	176.00	t	\N	t
27	Jakub	Szybki	jakub.szybki	$2a$10$hR5VIjEv.jnLf.J2uKeQqelSJbTCts8.xCrLrFhw9e1HrbFqMLxku	1995-05-15	Polska		60.00	177.00	t	\N	t
28	Paweł	Broda	pawel.broda	$2a$10$tIPPUXXA6l5w/Aykk4euOOd83VncvBh4rSF8nVh6YRrlQ2ydMAXcm	1999-06-02	Polska		60.00	184.00	t	\N	t
29	Jakub	Dawicki	jakub.dawicki	$2a$10$Gt3L9UucaE0dayvlQXDN.uz66lbUbwmtH8S4aRAK0b8rna6CZb3d2	1990-03-12	Polska		64.00	180.00	t	\N	t
42	Ryszard	Piątek	ryszard.piatek	$2a$10$TVrEAK2t9/iA.TdOWfy5Ke6uODHE03cmUTgqe4TLiKqtJKcx617kS	1991-08-14	Polska		60.00	172.00	t	\N	t
30	Maciej	Pies	maciej.pies	$2a$10$6Afq2zxSTWnB9LJxN/I2QOO9OdGLyBqG04.GnN9N9ueY7Zmebm9LK	1991-06-09	Polska		61.00	178.00	t	\N	t
31	Aleksander	Naprawczyn	aleksander.naprawczyn	$2a$10$YDmQj9ja1I9CUKrny5jpVuBTAr3EpNPjhhH1ukvDNNz2q8M43RvGS	1994-03-08	Polska		59.00	179.00	t	\N	t
44	Krzysztof	Sandał	krzysztof.sandal	$2a$10$p5OJqfBT3UFAh3.5y.IO8OT7ZjxP5q2VlIOlqOmLJCJJwDFeOS0ri	2001-02-07	Polska		59.00	173.00	t	\N	t
45	Tomasz	Zając	tomasz.zajac	$2a$10$Cj56rnpZ5zAF4gdWWyIw1eKXfe0fLLbxrJJbGWD2swKRElMuN9wxO	2000-04-26	Polska		60.00	178.00	t	\N	t
33	Stefan	Bula	stefan.bula	$2a$10$ex4K4ifuNRTwseZn22ZIzu0zduatQVqaTqnHb2gCd1lZexEC/97hy	2006-09-29	Polska		57.00	174.00	t	\N	t
46	Krystian	Pełka	krystian.pelka	$2a$10$p4L5GwPImoj8l9R2mb4.euzb3e3eSPf9rZEkrBgKYBgYwdcl2rxXm	1995-03-28	Polska		63.00	176.00	t	\N	t
32	Adam	Dużysz	adam.duzysz	$2a$10$J6IkdOuQ.3WyMA.iSiYTye9Wk7AzmpMnk1VprSO6lWfAtP0vPlBsS	2007-12-03	Polska		55.00	170.00	t	\N	t
47	Szymon	Amam	szymon.amam	$2a$10$1fiNKsU7Wfw6.TyEZj86CuSDgMLKFkEaf/Tzd8tYwYown.6o82TOq	1981-06-25	Polska		60.00	173.00	t	\N	t
34	Piotr	Precel	piotr.precel	$2a$10$JU6Bu8Zd99l6Vdav.b7v8eV77oS0CeAr6e.Ky53XfsBkC6mFo3ewO	1992-09-20	Polska		64.00	179.00	t	\N	t
48	Grzegorz	Szloren	grzegorz.sloren	$2a$10$qwnxQHFcjT9FKk4laBl0H.FTi.tJCjSVkmAozo/4Qk1DKpHzxkffC	1990-01-07	Polska		64.00	180.00	t	\N	t
35	Stefan	Silny	stefan.silny	$2a$10$LPBsrV2BH0YWT2I6gAQ6H.ItPANQSObx2k01Ag/Uw/F.srFn5a1XC	1993-05-13	Polska		56.00	170.00	t	\N	t
36	Andrzej	Fala	andrzej.fala	$2a$10$vqAhuGNDw1ZL3u4fl.z0v.3tBgJPXjOwpyzK4XVGpyztVCjDGd0vG	1995-08-28	Polska		65.00	184.00	t	\N	t
37	Roman	Pościel	roman.posciel	$2a$10$AFS1.sAgEAKEcZ2CnIagK.FVbkO2CBchtLEB2I1sOtvA/TUCLFeIi	1989-07-09	Polska		55.00	170.00	t	\N	t
39	Daniel	Panda	daniel.panda	$2a$10$XduyVQ47j0lFJnIffuRTjONp0njKPQYRklOEBsMBsBdSSU1AA.6Ou	1994-01-24	Polska		64.00	182.00	t	\N	t
50	Błażej	Seldak	blazej.seldak	$2a$10$UhhnADXC9MgmtWCjk86tL.aK1AQDUXz/6Hf/Ml69kvC1whOAFH3Vi	1981-06-15	Polska		\N	\N	t	\N	t
52	Aleksander	Stożek	aleksander.stozek	$2a$10$iGEfoajTNHFgZJnSbahOpuUdmaR61vzLR9bR/7xJu3owFcYNXCUpW	1973-12-11	Polska		\N	\N	t	\N	t
51	Michał	Poleżak	michal.polezak	$2a$10$Ukgtp5b2Y0d3QiqkUQNPEuqid8i1lKyII8MYlATyJs9O2MXCeBRzq	1978-03-11	Polska		\N	\N	t	\N	t
53	Sebastian	Muminek	sebastian.muminek	$2a$10$a81vAtona7MrZ7F1WhDtqez4QVezpY6s0FHY3Cs8IzKzeLJGVYS/S	1994-04-16			74.00	187.00	t	\N	t
56	Kacper	Strzelczyk	kacper.strzelczyk	$2a$10$TcbQvMYfrXlLpZm3fZTGxu3/6EjZAU6MMAROVcXnkod3WhE22B4wu	2002-05-09	Polska		\N	\N	t	\N	t
41	Łukasz	Orzeł	lukasz.orzel	$2a$10$M1RyFCWwb2ZIarNksM065O1xcFt6HYXvUGMXQS2Sj/FAOCoK4upEq	1975-11-01	Polska		\N	\N	t	2025-11-18 18:31:54.234144	f
49	Władysław	Gofer	wladyslaw.gofer	$2a$10$IfcQM0FhiPto4c3SEuZz8.nDQb2I5j2DcU/dqfrg7wEbYhhwU6lVG	1955-02-25	Polska		\N	\N	t	2025-11-18 17:56:42.726346	f
55	Rafał	Pies	rafal.pies	$2a$10$UlkLQEErdgvNliNalx3kh./G.qqci3dJJWxs2r3KPgnIXS8YtSuPa	1960-12-21	Polska		\N	\N	t	2025-11-18 17:58:59.139943	f
38	Jerzy	Kokosanka	jerzy.kokosanka	$2a$10$Tu08kXJ7tSEmAeIQ7RurmeaqOJCwR1lyJ1txR7GNmwgYxJfgNN8Pe	1985-11-05	Polska		\N	\N	t	2025-11-18 17:14:29.069608	f
2	Admin	User	admin	$2a$10$h8b2Q46oc/vp6IWTx2xxNeSw1rsnv7EOL2wV9k9IGKzJIT.BKSAvW	1990-01-01	Polish		0.00	0.00	t	2025-11-18 21:09:20.775336	f
40	Michał	Michałek	michal.michalek	$2a$10$aJGrWSosID/x2MAQE0i9FuhQWFbbWogTV/fS8vopMCfS5d/JPxLTq	1982-03-28	Polska		\N	\N	t	2025-11-18 21:12:20.422395	f
54	Sławomir	Grzyb	slawomir.grzyb	$2a$10$6f.iF3DZZ7rfwfBO30eoquHjS/1RpkcHJAv7XJP2zY0Q2Fcf4Z89i	1955-06-11	Polska		\N	\N	t	2025-11-18 18:25:14.709037	f
\.


--
-- Name: event_participants_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.event_participants_id_seq', 38, true);


--
-- Name: events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.events_id_seq', 19, true);


--
-- Name: hills_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.hills_id_seq', 36, true);


--
-- Name: injuries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.injuries_id_seq', 17, true);


--
-- Name: results_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.results_id_seq', 41, true);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.roles_id_seq', 6, true);


--
-- Name: teams_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.teams_id_seq', 12, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 56, true);


--
-- Name: event_allowed_team event_allowed_team_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_allowed_team
    ADD CONSTRAINT event_allowed_team_pkey PRIMARY KEY (event_id, team_id);


--
-- Name: event_participants event_participants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_participants
    ADD CONSTRAINT event_participants_pkey PRIMARY KEY (id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: hills hills_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hills
    ADD CONSTRAINT hills_pkey PRIMARY KEY (id);


--
-- Name: injuries injuries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.injuries
    ADD CONSTRAINT injuries_pkey PRIMARY KEY (id);


--
-- Name: results results_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.results
    ADD CONSTRAINT results_pkey PRIMARY KEY (id, season);


--
-- Name: results_2025_2026 results_2025_2026_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.results_2025_2026
    ADD CONSTRAINT results_2025_2026_pkey PRIMARY KEY (id, season);


--
-- Name: results_2026_2027 results_2026_2027_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.results_2026_2027
    ADD CONSTRAINT results_2026_2027_pkey PRIMARY KEY (id, season);


--
-- Name: roles roles_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_key UNIQUE (name);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: teams teams_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_pkey PRIMARY KEY (id);


--
-- Name: teams unique_team_name; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT unique_team_name UNIQUE (name);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (user_id, role_id);


--
-- Name: user_teams user_teams_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_teams
    ADD CONSTRAINT user_teams_pkey PRIMARY KEY (user_id, team_id);


--
-- Name: users users_login_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_login_key UNIQUE (login);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: results_2025_2026_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.results_pkey ATTACH PARTITION public.results_2025_2026_pkey;


--
-- Name: results_2026_2027_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.results_pkey ATTACH PARTITION public.results_2026_2027_pkey;


--
-- Name: event_allowed_team event_allowed_team_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_allowed_team
    ADD CONSTRAINT event_allowed_team_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: event_allowed_team event_allowed_team_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_allowed_team
    ADD CONSTRAINT event_allowed_team_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE;


--
-- Name: event_participants event_participants_athlete_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_participants
    ADD CONSTRAINT event_participants_athlete_id_fkey FOREIGN KEY (athlete_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: event_participants event_participants_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_participants
    ADD CONSTRAINT event_participants_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: events events_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: events events_hill_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_hill_id_fkey FOREIGN KEY (hill_id) REFERENCES public.hills(id) ON DELETE RESTRICT;


--
-- Name: user_teams fk_team; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_teams
    ADD CONSTRAINT fk_team FOREIGN KEY (team_id) REFERENCES public.teams(id);


--
-- Name: user_teams fk_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_teams
    ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: injuries injuries_athlete_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.injuries
    ADD CONSTRAINT injuries_athlete_id_fkey FOREIGN KEY (athlete_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: results results_athlete_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE public.results
    ADD CONSTRAINT results_athlete_id_fkey FOREIGN KEY (athlete_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: results results_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE public.results
    ADD CONSTRAINT results_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--



--
-- fullscreenQL database dump
--

-- Dumped from database version 9.4.12
-- Dumped by pg_dump version 10.4 (Ubuntu 10.4-2.pgdg16.04+1)

-- Started on 2018-07-12 15:13:52 EEST

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 8 (class 2615 OID 16385)
-- Name: fsd_enel; Type: SCHEMA; Schema: -; Owner: fullscreen
--

CREATE SCHEMA "fsd_enel";


ALTER SCHEMA "fsd_enel" OWNER TO "fullscreen";

SET default_tablespace = '';

SET default_with_oids = false;

--
-- TOC entry 212 (class 1259 OID 42123)
-- Name: agent; Type: TABLE; Schema: fsd_enel; Owner: fullscreen
--

CREATE TABLE "fsd_enel"."agent" (
    "id" integer NOT NULL,
    "marca" character varying(255),
    "email" character varying(255),
    "password" character varying(255) NOT NULL,
    "firstName" character varying(255),
    "lastName" character varying(255),
    "otpsec" character varying(255),
    "type" character varying(255) NOT NULL,
    "role" character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "companyId" integer
);


ALTER TABLE "fsd_enel"."agent" OWNER TO "fullscreen";

--
-- TOC entry 211 (class 1259 OID 42121)
-- Name: agent_id_seq; Type: SEQUENCE; Schema: fsd_enel; Owner: fullscreen
--

CREATE SEQUENCE "fsd_enel"."agent_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "fsd_enel"."agent_id_seq" OWNER TO "fullscreen";

--
-- TOC entry 2246 (class 0 OID 0)
-- Dependencies: 211
-- Name: agent_id_seq; Type: SEQUENCE OWNED BY; Schema: fsd_enel; Owner: fullscreen
--

ALTER SEQUENCE "fsd_enel"."agent_id_seq" OWNED BY "fsd_enel"."agent"."id";


--
-- TOC entry 174 (class 1259 OID 16394)
-- Name: agreements; Type: TABLE; Schema: fsd_enel; Owner: fullscreen
--

CREATE TABLE "fsd_enel"."agreements" (
    "id" character varying(255) NOT NULL,
    "html" "text" NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE "fsd_enel"."agreements" OWNER TO "fullscreen";

--
-- TOC entry 175 (class 1259 OID 16400)
-- Name: artera; Type: TABLE; Schema: fsd_enel; Owner: fullscreen
--

CREATE TABLE "fsd_enel"."artera" (
    "id" integer NOT NULL,
    "cod" character varying(255) NOT NULL,
    "prefix" character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE "fsd_enel"."artera" OWNER TO "fullscreen";

--
-- TOC entry 176 (class 1259 OID 16406)
-- Name: artera_id_seq; Type: SEQUENCE; Schema: fsd_enel; Owner: fullscreen
--

CREATE SEQUENCE "fsd_enel"."artera_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "fsd_enel"."artera_id_seq" OWNER TO "fullscreen";

--
-- TOC entry 2247 (class 0 OID 0)
-- Dependencies: 176
-- Name: artera_id_seq; Type: SEQUENCE OWNED BY; Schema: fsd_enel; Owner: fullscreen
--

ALTER SEQUENCE "fsd_enel"."artera_id_seq" OWNED BY "fsd_enel"."artera"."id";


--
-- TOC entry 177 (class 1259 OID 16408)
-- Name: banca; Type: TABLE; Schema: fsd_enel; Owner: fullscreen
--

CREATE TABLE "fsd_enel"."banca" (
    "id" integer NOT NULL,
    "cod" character varying(255),
    "denumire" character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE "fsd_enel"."banca" OWNER TO "fullscreen";

--
-- TOC entry 178 (class 1259 OID 16414)
-- Name: banca_id_seq; Type: SEQUENCE; Schema: fsd_enel; Owner: fullscreen
--

CREATE SEQUENCE "fsd_enel"."banca_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "fsd_enel"."banca_id_seq" OWNER TO "fullscreen";

--
-- TOC entry 2248 (class 0 OID 0)
-- Dependencies: 178
-- Name: banca_id_seq; Type: SEQUENCE OWNED BY; Schema: fsd_enel; Owner: fullscreen
--

ALTER SEQUENCE "fsd_enel"."banca_id_seq" OWNED BY "fsd_enel"."banca"."id";


--
-- TOC entry 179 (class 1259 OID 16416)
-- Name: canal; Type: TABLE; Schema: fsd_enel; Owner: fullscreen
--

CREATE TABLE "fsd_enel"."canal" (
    "id" integer NOT NULL,
    "internal_id" bigint,
    "denumire" character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE "fsd_enel"."canal" OWNER TO "fullscreen";

--
-- TOC entry 180 (class 1259 OID 16419)
-- Name: canal_id_seq; Type: SEQUENCE; Schema: fsd_enel; Owner: fullscreen
--

CREATE SEQUENCE "fsd_enel"."canal_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "fsd_enel"."canal_id_seq" OWNER TO "fullscreen";

--
-- TOC entry 2249 (class 0 OID 0)
-- Dependencies: 180
-- Name: canal_id_seq; Type: SEQUENCE OWNED BY; Schema: fsd_enel; Owner: fullscreen
--

ALTER SEQUENCE "fsd_enel"."canal_id_seq" OWNED BY "fsd_enel"."canal"."id";


--
-- TOC entry 181 (class 1259 OID 16421)
-- Name: cod_caen; Type: TABLE; Schema: fsd_enel; Owner: fullscreen
--

CREATE TABLE "fsd_enel"."cod_caen" (
    "id" integer NOT NULL,
    "cod" character varying(255),
    "denumire" character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE "fsd_enel"."cod_caen" OWNER TO "fullscreen";

--
-- TOC entry 182 (class 1259 OID 16427)
-- Name: cod_caen_id_seq; Type: SEQUENCE; Schema: fsd_enel; Owner: fullscreen
--

CREATE SEQUENCE "fsd_enel"."cod_caen_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "fsd_enel"."cod_caen_id_seq" OWNER TO "fullscreen";

--
-- TOC entry 2250 (class 0 OID 0)
-- Dependencies: 182
-- Name: cod_caen_id_seq; Type: SEQUENCE OWNED BY; Schema: fsd_enel; Owner: fullscreen
--

ALTER SEQUENCE "fsd_enel"."cod_caen_id_seq" OWNED BY "fsd_enel"."cod_caen"."id";


--
-- TOC entry 183 (class 1259 OID 16429)
-- Name: cod_postal; Type: TABLE; Schema: fsd_enel; Owner: fullscreen
--

CREATE TABLE "fsd_enel"."cod_postal" (
    "id" integer NOT NULL,
    "cod_postal" character varying(255),
    "nr_de_la" character varying(255),
    "nr_la" character varying(255),
    "par_impar" character(255),
    "strada_id" bigint,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE "fsd_enel"."cod_postal" OWNER TO "fullscreen";

--
-- TOC entry 184 (class 1259 OID 16435)
-- Name: cod_postal_id_seq; Type: SEQUENCE; Schema: fsd_enel; Owner: fullscreen
--

CREATE SEQUENCE "fsd_enel"."cod_postal_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "fsd_enel"."cod_postal_id_seq" OWNER TO "fullscreen";

--
-- TOC entry 2251 (class 0 OID 0)
-- Dependencies: 184
-- Name: cod_postal_id_seq; Type: SEQUENCE OWNED BY; Schema: fsd_enel; Owner: fullscreen
--

ALTER SEQUENCE "fsd_enel"."cod_postal_id_seq" OWNED BY "fsd_enel"."cod_postal"."id";


--
-- TOC entry 185 (class 1259 OID 16437)
-- Name: company; Type: TABLE; Schema: fsd_enel; Owner: fullscreen
--

CREATE TABLE "fsd_enel"."company" (
    "id" integer NOT NULL,
    "denumire" character varying(255) NOT NULL,
    "adresa" character varying(255),
    "oras" character varying(255),
    "judet" character varying(255),
    "cui" character varying(255),
    "j" character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE "fsd_enel"."company" OWNER TO "fullscreen";

--
-- TOC entry 186 (class 1259 OID 16443)
-- Name: company_id_seq; Type: SEQUENCE; Schema: fsd_enel; Owner: fullscreen
--

CREATE SEQUENCE "fsd_enel"."company_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "fsd_enel"."company_id_seq" OWNER TO "fullscreen";

--
-- TOC entry 2252 (class 0 OID 0)
-- Dependencies: 186
-- Name: company_id_seq; Type: SEQUENCE OWNED BY; Schema: fsd_enel; Owner: fullscreen
--

ALTER SEQUENCE "fsd_enel"."company_id_seq" OWNED BY "fsd_enel"."company"."id";


--
-- TOC entry 187 (class 1259 OID 16445)
-- Name: distribuitor; Type: TABLE; Schema: fsd_enel; Owner: fullscreen
--

CREATE TABLE "fsd_enel"."distribuitor" (
    "id" integer NOT NULL,
    "internal_id" bigint NOT NULL,
    "denumire" character varying(255),
    "cui" character varying(255),
    "mail" character varying(255),
    "ee" boolean DEFAULT false,
    "gaz" boolean DEFAULT false,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE "fsd_enel"."distribuitor" OWNER TO "fullscreen";

--
-- TOC entry 188 (class 1259 OID 16453)
-- Name: distribuitor_id_seq; Type: SEQUENCE; Schema: fsd_enel; Owner: fullscreen
--

CREATE SEQUENCE "fsd_enel"."distribuitor_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "fsd_enel"."distribuitor_id_seq" OWNER TO "fullscreen";

--
-- TOC entry 2253 (class 0 OID 0)
-- Dependencies: 188
-- Name: distribuitor_id_seq; Type: SEQUENCE OWNED BY; Schema: fsd_enel; Owner: fullscreen
--

ALTER SEQUENCE "fsd_enel"."distribuitor_id_seq" OWNED BY "fsd_enel"."distribuitor"."id";


--
-- TOC entry 189 (class 1259 OID 16455)
-- Name: furnizor; Type: TABLE; Schema: fsd_enel; Owner: fullscreen
--

CREATE TABLE "fsd_enel"."furnizor" (
    "id" integer NOT NULL,
    "internal_id" bigint NOT NULL,
    "denumire" character varying(255),
    "cui" character varying(255),
    "mail" character varying(255),
    "ee" boolean DEFAULT false,
    "gaz" boolean DEFAULT false,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE "fsd_enel"."furnizor" OWNER TO "fullscreen";

--
-- TOC entry 190 (class 1259 OID 16463)
-- Name: furnizor_id_seq; Type: SEQUENCE; Schema: fsd_enel; Owner: fullscreen
--

CREATE SEQUENCE "fsd_enel"."furnizor_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "fsd_enel"."furnizor_id_seq" OWNER TO "fullscreen";

--
-- TOC entry 2254 (class 0 OID 0)
-- Dependencies: 190
-- Name: furnizor_id_seq; Type: SEQUENCE OWNED BY; Schema: fsd_enel; Owner: fullscreen
--

ALTER SEQUENCE "fsd_enel"."furnizor_id_seq" OWNED BY "fsd_enel"."furnizor"."id";


--
-- TOC entry 191 (class 1259 OID 16465)
-- Name: gama_serviciu; Type: TABLE; Schema: fsd_enel; Owner: fullscreen
--

CREATE TABLE "fsd_enel"."gama_serviciu" (
    "id" integer NOT NULL,
    "serviciu" character varying(255),
    "cod" character varying(255),
    "denumire" character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE "fsd_enel"."gama_serviciu" OWNER TO "fullscreen";

--
-- TOC entry 192 (class 1259 OID 16471)
-- Name: gama_serviciu_id_seq; Type: SEQUENCE; Schema: fsd_enel; Owner: fullscreen
--

CREATE SEQUENCE "fsd_enel"."gama_serviciu_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "fsd_enel"."gama_serviciu_id_seq" OWNER TO "fullscreen";

--
-- TOC entry 2255 (class 0 OID 0)
-- Dependencies: 192
-- Name: gama_serviciu_id_seq; Type: SEQUENCE OWNED BY; Schema: fsd_enel; Owner: fullscreen
--

ALTER SEQUENCE "fsd_enel"."gama_serviciu_id_seq" OWNED BY "fsd_enel"."gama_serviciu"."id";


--
-- TOC entry 193 (class 1259 OID 16473)
-- Name: jud_zd; Type: TABLE; Schema: fsd_enel; Owner: fullscreen
--

CREATE TABLE "fsd_enel"."jud_zd" (
    "jud_id" bigint NOT NULL,
    "jud_distributie" character varying(50) NOT NULL,
    "companie_distributie" character varying(255),
    "distributie_enel" character(1) NOT NULL,
    "cantitate_contractata" integer DEFAULT 1450,
    "id_enel" character varying(50) NOT NULL
);


ALTER TABLE "fsd_enel"."jud_zd" OWNER TO "fullscreen";

--
-- TOC entry 194 (class 1259 OID 16477)
-- Name: judet; Type: TABLE; Schema: fsd_enel; Owner: fullscreen
--

CREATE TABLE "fsd_enel"."judet" (
    "id" integer NOT NULL,
    "denumire" "text" NOT NULL,
    "cod" character varying(255) NOT NULL,
    "prefixTel" character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE "fsd_enel"."judet" OWNER TO "fullscreen";

--
-- TOC entry 195 (class 1259 OID 16483)
-- Name: judet_id_seq; Type: SEQUENCE; Schema: fsd_enel; Owner: fullscreen
--

CREATE SEQUENCE "fsd_enel"."judet_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "fsd_enel"."judet_id_seq" OWNER TO "fullscreen";

--
-- TOC entry 2256 (class 0 OID 0)
-- Dependencies: 195
-- Name: judet_id_seq; Type: SEQUENCE OWNED BY; Schema: fsd_enel; Owner: fullscreen
--

ALTER SEQUENCE "fsd_enel"."judet_id_seq" OWNED BY "fsd_enel"."judet"."id";


--
-- TOC entry 196 (class 1259 OID 16485)
-- Name: localitate; Type: TABLE; Schema: fsd_enel; Owner: fullscreen
--

CREATE TABLE "fsd_enel"."localitate" (
    "id" integer NOT NULL,
    "denumire" character varying(255) NOT NULL,
    "judet" character varying(255),
    "internal_id" bigint,
    "urban" boolean DEFAULT false,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE "fsd_enel"."localitate" OWNER TO "fullscreen";

--
-- TOC entry 197 (class 1259 OID 16492)
-- Name: localitate_id_seq; Type: SEQUENCE; Schema: fsd_enel; Owner: fullscreen
--

CREATE SEQUENCE "fsd_enel"."localitate_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "fsd_enel"."localitate_id_seq" OWNER TO "fullscreen";

--
-- TOC entry 2257 (class 0 OID 0)
-- Dependencies: 197
-- Name: localitate_id_seq; Type: SEQUENCE OWNED BY; Schema: fsd_enel; Owner: fullscreen
--

ALTER SEQUENCE "fsd_enel"."localitate_id_seq" OWNED BY "fsd_enel"."localitate"."id";


--
-- TOC entry 218 (class 1259 OID 66696)
-- Name: passwords; Type: TABLE; Schema: fsd_enel; Owner: fullscreen
--

CREATE TABLE "fsd_enel"."passwords" (
    "id" integer NOT NULL,
    "password" character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "userId" integer
);


ALTER TABLE "fsd_enel"."passwords" OWNER TO "fullscreen";

--
-- TOC entry 217 (class 1259 OID 66694)
-- Name: passwords_id_seq; Type: SEQUENCE; Schema: fsd_enel; Owner: fullscreen
--

CREATE SEQUENCE "fsd_enel"."passwords_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "fsd_enel"."passwords_id_seq" OWNER TO "fullscreen";

--
-- TOC entry 2258 (class 0 OID 0)
-- Dependencies: 217
-- Name: passwords_id_seq; Type: SEQUENCE OWNED BY; Schema: fsd_enel; Owner: fullscreen
--

ALTER SEQUENCE "fsd_enel"."passwords_id_seq" OWNED BY "fsd_enel"."passwords"."id";


--
-- TOC entry 198 (class 1259 OID 16494)
-- Name: segment; Type: TABLE; Schema: fsd_enel; Owner: fullscreen
--

CREATE TABLE "fsd_enel"."segment" (
    "id" integer NOT NULL,
    "cod" character varying(255),
    "denumire" character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE "fsd_enel"."segment" OWNER TO "fullscreen";

--
-- TOC entry 199 (class 1259 OID 16500)
-- Name: segment_id_seq; Type: SEQUENCE; Schema: fsd_enel; Owner: fullscreen
--

CREATE SEQUENCE "fsd_enel"."segment_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "fsd_enel"."segment_id_seq" OWNER TO "fullscreen";

--
-- TOC entry 2259 (class 0 OID 0)
-- Dependencies: 199
-- Name: segment_id_seq; Type: SEQUENCE OWNED BY; Schema: fsd_enel; Owner: fullscreen
--

ALTER SEQUENCE "fsd_enel"."segment_id_seq" OWNED BY "fsd_enel"."segment"."id";


--
-- TOC entry 200 (class 1259 OID 16502)
-- Name: service_offers; Type: TABLE; Schema: fsd_enel; Owner: fullscreen
--

CREATE TABLE "fsd_enel"."service_offers" (
    "id" integer NOT NULL,
    "serviciu" character varying(15),
    "gama" character varying(15),
    "tip" character varying(15),
    "seg" character varying(15),
    "site" boolean,
    "cod" character varying(15),
    "denumire" character varying(128),
    "de_la" timestamp with time zone,
    "la" timestamp with time zone,
    "pret" numeric(22,6),
    "pret_ea" numeric(22,6),
    "pret_eaz" numeric(22,6),
    "pret_eanw" numeric(22,6),
    "pret_eano" numeric(22,6),
    "pret_gaz" numeric(22,6),
    "pret_tr_gaz" numeric(22,6),
    "abonament" numeric(22,6),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE "fsd_enel"."service_offers" OWNER TO "fullscreen";

--
-- TOC entry 201 (class 1259 OID 16505)
-- Name: service_offers_id_seq; Type: SEQUENCE; Schema: fsd_enel; Owner: fullscreen
--

CREATE SEQUENCE "fsd_enel"."service_offers_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "fsd_enel"."service_offers_id_seq" OWNER TO "fullscreen";

--
-- TOC entry 2260 (class 0 OID 0)
-- Dependencies: 201
-- Name: service_offers_id_seq; Type: SEQUENCE OWNED BY; Schema: fsd_enel; Owner: fullscreen
--

ALTER SEQUENCE "fsd_enel"."service_offers_id_seq" OWNED BY "fsd_enel"."service_offers"."id";


--
-- TOC entry 202 (class 1259 OID 16507)
-- Name: session; Type: TABLE; Schema: fsd_enel; Owner: fullscreen
--

CREATE TABLE "fsd_enel"."session" (
    "id" integer NOT NULL,
    "status" character varying(255) NOT NULL,
    "agent_id" integer,
    "nume" character varying(255),
    "prenume" character varying(255),
    "secret" character varying(255) NOT NULL,
    "perioada_furnizare" integer,
    "judet" character varying(255),
    "tip_client" character varying(255),
    "scadenta_factura" integer,
    "ee_offer_success" boolean,
    "ee_offer_error" "json",
    "ee_offer_date" timestamp with time zone,
    "ee_offer_request" "json",
    "ee_offer_internal_id" bigint,
    "ee_sign_success" boolean,
    "ee_sign_error" "json",
    "ee_sign_date" timestamp with time zone,
    "ee_activate_success" boolean,
    "ee_activate_error" "json",
    "ee_activate_date" timestamp with time zone,
    "ee_agree" boolean,
    "gaz_offer_success" boolean,
    "gaz_offer_error" "json",
    "gaz_offer_date" timestamp with time zone,
    "gaz_offer_request" "json",
    "gaz_offer_internal_id" bigint,
    "gaz_sign_success" boolean,
    "gaz_sign_error" "json",
    "gaz_sign_date" timestamp with time zone,
    "gaz_activate_success" boolean,
    "gaz_activate_error" "json",
    "gaz_activate_date" timestamp with time zone,
    "gaz_agree" boolean,
    "is_closed" boolean NOT NULL,
    "closed_date" timestamp with time zone,
    "type" character varying(5),
    "ee_documents" "json",
    "gaz_documents" "json",
    "ee_generated_documents" "json",
    "gaz_generated_documents" "json",
    "ee_serviciu" "json",
    "gaz_serviciu" "json",
    "ee_schimba_furnizor" boolean,
    "ee_are_furnizare_activa" boolean,
    "ee_schimba_titular" boolean,
    "gaz_schimba_furnizor" boolean,
    "gaz_are_furnizare_activa" boolean,
    "gaz_schimba_titular" boolean,
    "client_update_cross" boolean,
    "client" "json",
    "ee_loc" "json",
    "gaz_loc" "json",
    "ee_loc_doc" "json",
    "gaz_loc_doc" "json",
    "ee_furnizor_viitor" bigint,
    "ee_furnizor_data_start" timestamp with time zone,
    "gaz_furnizor_viitor" bigint,
    "gaz_furnizor_data_start" timestamp with time zone,
    "ee_factura" "json",
    "gaz_factura" "json",
    "ee_consum" "json",
    "gaz_consum" "json",
    "ee_contact" "json",
    "gaz_contact" "json",
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "ocr_count" integer DEFAULT 0 NOT NULL,
    "ee_last_page" character varying(100),
    "gaz_last_page" character varying(100),
    "client_app" character varying(255),
    "company_id" integer
);


ALTER TABLE "fsd_enel"."session" OWNER TO "fullscreen";

--
-- TOC entry 203 (class 1259 OID 16513)
-- Name: session_id_seq; Type: SEQUENCE; Schema: fsd_enel; Owner: fullscreen
--

CREATE SEQUENCE "fsd_enel"."session_id_seq"
    START WITH 5000
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "fsd_enel"."session_id_seq" OWNER TO "fullscreen";

--
-- TOC entry 2261 (class 0 OID 0)
-- Dependencies: 203
-- Name: session_id_seq; Type: SEQUENCE OWNED BY; Schema: fsd_enel; Owner: fullscreen
--

ALTER SEQUENCE "fsd_enel"."session_id_seq" OWNED BY "fsd_enel"."session"."id";


--
-- TOC entry 204 (class 1259 OID 16515)
-- Name: strada; Type: TABLE; Schema: fsd_enel; Owner: fullscreen
--

CREATE TABLE "fsd_enel"."strada" (
    "id" integer NOT NULL,
    "internal_id" bigint,
    "localitate_id" bigint,
    "tip_artera" "text",
    "denumire" "text",
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE "fsd_enel"."strada" OWNER TO "fullscreen";

--
-- TOC entry 205 (class 1259 OID 16521)
-- Name: strada_id_seq; Type: SEQUENCE; Schema: fsd_enel; Owner: fullscreen
--

CREATE SEQUENCE "fsd_enel"."strada_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "fsd_enel"."strada_id_seq" OWNER TO "fullscreen";

--
-- TOC entry 2262 (class 0 OID 0)
-- Dependencies: 205
-- Name: strada_id_seq; Type: SEQUENCE OWNED BY; Schema: fsd_enel; Owner: fullscreen
--

ALTER SEQUENCE "fsd_enel"."strada_id_seq" OWNED BY "fsd_enel"."strada"."id";


--
-- TOC entry 206 (class 1259 OID 16523)
-- Name: tip_canal; Type: TABLE; Schema: fsd_enel; Owner: fullscreen
--

CREATE TABLE "fsd_enel"."tip_canal" (
    "id" integer NOT NULL,
    "internal_id" bigint NOT NULL,
    "denumire" character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE "fsd_enel"."tip_canal" OWNER TO "fullscreen";

--
-- TOC entry 207 (class 1259 OID 16526)
-- Name: tip_canal_id_seq; Type: SEQUENCE; Schema: fsd_enel; Owner: fullscreen
--

CREATE SEQUENCE "fsd_enel"."tip_canal_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "fsd_enel"."tip_canal_id_seq" OWNER TO "fullscreen";

--
-- TOC entry 2263 (class 0 OID 0)
-- Dependencies: 207
-- Name: tip_canal_id_seq; Type: SEQUENCE OWNED BY; Schema: fsd_enel; Owner: fullscreen
--

ALTER SEQUENCE "fsd_enel"."tip_canal_id_seq" OWNED BY "fsd_enel"."tip_canal"."id";


--
-- TOC entry 208 (class 1259 OID 16528)
-- Name: tip_serviciu; Type: TABLE; Schema: fsd_enel; Owner: fullscreen
--

CREATE TABLE "fsd_enel"."tip_serviciu" (
    "id" integer NOT NULL,
    "cod" character varying(255) NOT NULL,
    "denumire" character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE "fsd_enel"."tip_serviciu" OWNER TO "fullscreen";

--
-- TOC entry 209 (class 1259 OID 16534)
-- Name: tip_serviciu_id_seq; Type: SEQUENCE; Schema: fsd_enel; Owner: fullscreen
--

CREATE SEQUENCE "fsd_enel"."tip_serviciu_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "fsd_enel"."tip_serviciu_id_seq" OWNER TO "fullscreen";

--
-- TOC entry 2264 (class 0 OID 0)
-- Dependencies: 209
-- Name: tip_serviciu_id_seq; Type: SEQUENCE OWNED BY; Schema: fsd_enel; Owner: fullscreen
--

ALTER SEQUENCE "fsd_enel"."tip_serviciu_id_seq" OWNED BY "fsd_enel"."tip_serviciu"."id";


--
-- TOC entry 216 (class 1259 OID 66688)
-- Name: tokens; Type: TABLE; Schema: fsd_enel; Owner: fullscreen
--

CREATE TABLE "fsd_enel"."tokens" (
    "id" integer NOT NULL,
    "token" character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE "fsd_enel"."tokens" OWNER TO "fullscreen";

--
-- TOC entry 215 (class 1259 OID 66686)
-- Name: tokens_id_seq; Type: SEQUENCE; Schema: fsd_enel; Owner: fullscreen
--

CREATE SEQUENCE "fsd_enel"."tokens_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "fsd_enel"."tokens_id_seq" OWNER TO "fullscreen";

--
-- TOC entry 2265 (class 0 OID 0)
-- Dependencies: 215
-- Name: tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: fsd_enel; Owner: fullscreen
--

ALTER SEQUENCE "fsd_enel"."tokens_id_seq" OWNED BY "fsd_enel"."tokens"."id";


--
-- TOC entry 214 (class 1259 OID 66669)
-- Name: users; Type: TABLE; Schema: fsd_enel; Owner: fullscreen
--

CREATE TABLE "fsd_enel"."users" (
    "id" integer NOT NULL,
    "marca" character varying(255),
    "email" character varying(255),
    "password" character varying(255) NOT NULL,
    "firstName" character varying(255),
    "lastName" character varying(255),
    "type" character varying(255) NOT NULL,
    "role" character varying(255) NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "lastLogin" timestamp with time zone,
    "failedLogins" integer,
    "maxPassReachDate" timestamp with time zone,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "companyId" integer,
    "employed" boolean DEFAULT false
);


ALTER TABLE "fsd_enel"."users" OWNER TO "fullscreen";

--
-- TOC entry 213 (class 1259 OID 66667)
-- Name: users_id_seq; Type: SEQUENCE; Schema: fsd_enel; Owner: fullscreen
--

CREATE SEQUENCE "fsd_enel"."users_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "fsd_enel"."users_id_seq" OWNER TO "fullscreen";

--
-- TOC entry 2266 (class 0 OID 0)
-- Dependencies: 213
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: fsd_enel; Owner: fullscreen
--

ALTER SEQUENCE "fsd_enel"."users_id_seq" OWNED BY "fsd_enel"."users"."id";


--
-- TOC entry 2058 (class 2604 OID 42126)
-- Name: agent id; Type: DEFAULT; Schema: fsd_enel; Owner: fullscreen
--

ALTER TABLE ONLY "fsd_enel"."agent" ALTER COLUMN "id" SET DEFAULT "nextval"('"fsd_enel"."agent_id_seq"'::"regclass");


--
-- TOC entry 2034 (class 2604 OID 16537)
-- Name: artera id; Type: DEFAULT; Schema: fsd_enel; Owner: fullscreen
--

ALTER TABLE ONLY "fsd_enel"."artera" ALTER COLUMN "id" SET DEFAULT "nextval"('"fsd_enel"."artera_id_seq"'::"regclass");


--
-- TOC entry 2035 (class 2604 OID 16538)
-- Name: banca id; Type: DEFAULT; Schema: fsd_enel; Owner: fullscreen
--

ALTER TABLE ONLY "fsd_enel"."banca" ALTER COLUMN "id" SET DEFAULT "nextval"('"fsd_enel"."banca_id_seq"'::"regclass");


--
-- TOC entry 2036 (class 2604 OID 16539)
-- Name: canal id; Type: DEFAULT; Schema: fsd_enel; Owner: fullscreen
--

ALTER TABLE ONLY "fsd_enel"."canal" ALTER COLUMN "id" SET DEFAULT "nextval"('"fsd_enel"."canal_id_seq"'::"regclass");


--
-- TOC entry 2037 (class 2604 OID 16540)
-- Name: cod_caen id; Type: DEFAULT; Schema: fsd_enel; Owner: fullscreen
--

ALTER TABLE ONLY "fsd_enel"."cod_caen" ALTER COLUMN "id" SET DEFAULT "nextval"('"fsd_enel"."cod_caen_id_seq"'::"regclass");


--
-- TOC entry 2038 (class 2604 OID 16541)
-- Name: cod_postal id; Type: DEFAULT; Schema: fsd_enel; Owner: fullscreen
--

ALTER TABLE ONLY "fsd_enel"."cod_postal" ALTER COLUMN "id" SET DEFAULT "nextval"('"fsd_enel"."cod_postal_id_seq"'::"regclass");


--
-- TOC entry 2039 (class 2604 OID 16542)
-- Name: company id; Type: DEFAULT; Schema: fsd_enel; Owner: fullscreen
--

ALTER TABLE ONLY "fsd_enel"."company" ALTER COLUMN "id" SET DEFAULT "nextval"('"fsd_enel"."company_id_seq"'::"regclass");


--
-- TOC entry 2042 (class 2604 OID 16543)
-- Name: distribuitor id; Type: DEFAULT; Schema: fsd_enel; Owner: fullscreen
--

ALTER TABLE ONLY "fsd_enel"."distribuitor" ALTER COLUMN "id" SET DEFAULT "nextval"('"fsd_enel"."distribuitor_id_seq"'::"regclass");


--
-- TOC entry 2045 (class 2604 OID 16544)
-- Name: furnizor id; Type: DEFAULT; Schema: fsd_enel; Owner: fullscreen
--

ALTER TABLE ONLY "fsd_enel"."furnizor" ALTER COLUMN "id" SET DEFAULT "nextval"('"fsd_enel"."furnizor_id_seq"'::"regclass");


--
-- TOC entry 2046 (class 2604 OID 16545)
-- Name: gama_serviciu id; Type: DEFAULT; Schema: fsd_enel; Owner: fullscreen
--

ALTER TABLE ONLY "fsd_enel"."gama_serviciu" ALTER COLUMN "id" SET DEFAULT "nextval"('"fsd_enel"."gama_serviciu_id_seq"'::"regclass");


--
-- TOC entry 2048 (class 2604 OID 16546)
-- Name: judet id; Type: DEFAULT; Schema: fsd_enel; Owner: fullscreen
--

ALTER TABLE ONLY "fsd_enel"."judet" ALTER COLUMN "id" SET DEFAULT "nextval"('"fsd_enel"."judet_id_seq"'::"regclass");


--
-- TOC entry 2050 (class 2604 OID 16547)
-- Name: localitate id; Type: DEFAULT; Schema: fsd_enel; Owner: fullscreen
--

ALTER TABLE ONLY "fsd_enel"."localitate" ALTER COLUMN "id" SET DEFAULT "nextval"('"fsd_enel"."localitate_id_seq"'::"regclass");


--
-- TOC entry 2063 (class 2604 OID 66699)
-- Name: passwords id; Type: DEFAULT; Schema: fsd_enel; Owner: fullscreen
--

ALTER TABLE ONLY "fsd_enel"."passwords" ALTER COLUMN "id" SET DEFAULT "nextval"('"fsd_enel"."passwords_id_seq"'::"regclass");


--
-- TOC entry 2051 (class 2604 OID 16548)
-- Name: segment id; Type: DEFAULT; Schema: fsd_enel; Owner: fullscreen
--

ALTER TABLE ONLY "fsd_enel"."segment" ALTER COLUMN "id" SET DEFAULT "nextval"('"fsd_enel"."segment_id_seq"'::"regclass");


--
-- TOC entry 2052 (class 2604 OID 16549)
-- Name: service_offers id; Type: DEFAULT; Schema: fsd_enel; Owner: fullscreen
--

ALTER TABLE ONLY "fsd_enel"."service_offers" ALTER COLUMN "id" SET DEFAULT "nextval"('"fsd_enel"."service_offers_id_seq"'::"regclass");


--
-- TOC entry 2053 (class 2604 OID 16550)
-- Name: session id; Type: DEFAULT; Schema: fsd_enel; Owner: fullscreen
--

ALTER TABLE ONLY "fsd_enel"."session" ALTER COLUMN "id" SET DEFAULT "nextval"('"fsd_enel"."session_id_seq"'::"regclass");


--
-- TOC entry 2055 (class 2604 OID 16551)
-- Name: strada id; Type: DEFAULT; Schema: fsd_enel; Owner: fullscreen
--

ALTER TABLE ONLY "fsd_enel"."strada" ALTER COLUMN "id" SET DEFAULT "nextval"('"fsd_enel"."strada_id_seq"'::"regclass");


--
-- TOC entry 2056 (class 2604 OID 16552)
-- Name: tip_canal id; Type: DEFAULT; Schema: fsd_enel; Owner: fullscreen
--

ALTER TABLE ONLY "fsd_enel"."tip_canal" ALTER COLUMN "id" SET DEFAULT "nextval"('"fsd_enel"."tip_canal_id_seq"'::"regclass");


--
-- TOC entry 2057 (class 2604 OID 16553)
-- Name: tip_serviciu id; Type: DEFAULT; Schema: fsd_enel; Owner: fullscreen
--

ALTER TABLE ONLY "fsd_enel"."tip_serviciu" ALTER COLUMN "id" SET DEFAULT "nextval"('"fsd_enel"."tip_serviciu_id_seq"'::"regclass");


--
-- TOC entry 2062 (class 2604 OID 66691)
-- Name: tokens id; Type: DEFAULT; Schema: fsd_enel; Owner: fullscreen
--

ALTER TABLE ONLY "fsd_enel"."tokens" ALTER COLUMN "id" SET DEFAULT "nextval"('"fsd_enel"."tokens_id_seq"'::"regclass");


--
-- TOC entry 2059 (class 2604 OID 66672)
-- Name: users id; Type: DEFAULT; Schema: fsd_enel; Owner: fullscreen
--

ALTER TABLE ONLY "fsd_enel"."users" ALTER COLUMN "id" SET DEFAULT "nextval"('"fsd_enel"."users_id_seq"'::"regclass");


--
-- TOC entry 2115 (class 2606 OID 42133)
-- Name: agent agent_marca_key; Type: CONSTRAINT; Schema: fsd_enel; Owner: fullscreen
--

ALTER TABLE ONLY "fsd_enel"."agent"
    ADD CONSTRAINT "agent_marca_key" UNIQUE ("marca");


--
-- TOC entry 2117 (class 2606 OID 42131)
-- Name: agent agent_pkey; Type: CONSTRAINT; Schema: fsd_enel; Owner: fullscreen
--

ALTER TABLE ONLY "fsd_enel"."agent"
    ADD CONSTRAINT "agent_pkey" PRIMARY KEY ("id");


--
-- TOC entry 2065 (class 2606 OID 17451)
-- Name: agreements agreements_pkey; Type: CONSTRAINT; Schema: fsd_enel; Owner: fullscreen
--

ALTER TABLE ONLY "fsd_enel"."agreements"
    ADD CONSTRAINT "agreements_pkey" PRIMARY KEY ("id");


--
-- TOC entry 2067 (class 2606 OID 17453)
-- Name: artera artera_cod_key; Type: CONSTRAINT; Schema: fsd_enel; Owner: fullscreen
--

ALTER TABLE ONLY "fsd_enel"."artera"
    ADD CONSTRAINT "artera_cod_key" UNIQUE ("cod");


--
-- TOC entry 2069 (class 2606 OID 17455)
-- Name: artera artera_pkey; Type: CONSTRAINT; Schema: fsd_enel; Owner: fullscreen
--

ALTER TABLE ONLY "fsd_enel"."artera"
    ADD CONSTRAINT "artera_pkey" PRIMARY KEY ("id");


--
-- TOC entry 2071 (class 2606 OID 17457)
-- Name: banca banca_pkey; Type: CONSTRAINT; Schema: fsd_enel; Owner: fullscreen
--

ALTER TABLE ONLY "fsd_enel"."banca"
    ADD CONSTRAINT "banca_pkey" PRIMARY KEY ("id");


--
-- TOC entry 2073 (class 2606 OID 17459)
-- Name: canal canal_pkey; Type: CONSTRAINT; Schema: fsd_enel; Owner: fullscreen
--

ALTER TABLE ONLY "fsd_enel"."canal"
    ADD CONSTRAINT "canal_pkey" PRIMARY KEY ("id");


--
-- TOC entry 2075 (class 2606 OID 17461)
-- Name: cod_caen cod_caen_pkey; Type: CONSTRAINT; Schema: fsd_enel; Owner: fullscreen
--

ALTER TABLE ONLY "fsd_enel"."cod_caen"
    ADD CONSTRAINT "cod_caen_pkey" PRIMARY KEY ("id");


--
-- TOC entry 2077 (class 2606 OID 17463)
-- Name: cod_postal cod_postal_pkey; Type: CONSTRAINT; Schema: fsd_enel; Owner: fullscreen
--

ALTER TABLE ONLY "fsd_enel"."cod_postal"
    ADD CONSTRAINT "cod_postal_pkey" PRIMARY KEY ("id");


--
-- TOC entry 2079 (class 2606 OID 17465)
-- Name: company company_pkey; Type: CONSTRAINT; Schema: fsd_enel; Owner: fullscreen
--

ALTER TABLE ONLY "fsd_enel"."company"
    ADD CONSTRAINT "company_pkey" PRIMARY KEY ("id");


--
-- TOC entry 2081 (class 2606 OID 17467)
-- Name: distribuitor distribuitor_internal_id_key; Type: CONSTRAINT; Schema: fsd_enel; Owner: fullscreen
--

ALTER TABLE ONLY "fsd_enel"."distribuitor"
    ADD CONSTRAINT "distribuitor_internal_id_key" UNIQUE ("internal_id");


--
-- TOC entry 2083 (class 2606 OID 17469)
-- Name: distribuitor distribuitor_pkey; Type: CONSTRAINT; Schema: fsd_enel; Owner: fullscreen
--

ALTER TABLE ONLY "fsd_enel"."distribuitor"
    ADD CONSTRAINT "distribuitor_pkey" PRIMARY KEY ("id");


--
-- TOC entry 2085 (class 2606 OID 17471)
-- Name: furnizor furnizor_internal_id_key; Type: CONSTRAINT; Schema: fsd_enel; Owner: fullscreen
--

ALTER TABLE ONLY "fsd_enel"."furnizor"
    ADD CONSTRAINT "furnizor_internal_id_key" UNIQUE ("internal_id");


--
-- TOC entry 2087 (class 2606 OID 17473)
-- Name: furnizor furnizor_pkey; Type: CONSTRAINT; Schema: fsd_enel; Owner: fullscreen
--

ALTER TABLE ONLY "fsd_enel"."furnizor"
    ADD CONSTRAINT "furnizor_pkey" PRIMARY KEY ("id");


--
-- TOC entry 2089 (class 2606 OID 17475)
-- Name: gama_serviciu gama_serviciu_pkey; Type: CONSTRAINT; Schema: fsd_enel; Owner: fullscreen
--

ALTER TABLE ONLY "fsd_enel"."gama_serviciu"
    ADD CONSTRAINT "gama_serviciu_pkey" PRIMARY KEY ("id");


--
-- TOC entry 2091 (class 2606 OID 17477)
-- Name: jud_zd jud_zd_jud_distributie_key; Type: CONSTRAINT; Schema: fsd_enel; Owner: fullscreen
--

ALTER TABLE ONLY "fsd_enel"."jud_zd"
    ADD CONSTRAINT "jud_zd_jud_distributie_key" UNIQUE ("jud_distributie");


--
-- TOC entry 2093 (class 2606 OID 17479)
-- Name: jud_zd jud_zd_pkey; Type: CONSTRAINT; Schema: fsd_enel; Owner: fullscreen
--

ALTER TABLE ONLY "fsd_enel"."jud_zd"
    ADD CONSTRAINT "jud_zd_pkey" PRIMARY KEY ("jud_id");


--
-- TOC entry 2095 (class 2606 OID 17481)
-- Name: judet judet_cod_key; Type: CONSTRAINT; Schema: fsd_enel; Owner: fullscreen
--

ALTER TABLE ONLY "fsd_enel"."judet"
    ADD CONSTRAINT "judet_cod_key" UNIQUE ("cod");


--
-- TOC entry 2097 (class 2606 OID 17483)
-- Name: judet judet_denumire_key; Type: CONSTRAINT; Schema: fsd_enel; Owner: fullscreen
--

ALTER TABLE ONLY "fsd_enel"."judet"
    ADD CONSTRAINT "judet_denumire_key" UNIQUE ("denumire");


--
-- TOC entry 2099 (class 2606 OID 17485)
-- Name: judet judet_pkey; Type: CONSTRAINT; Schema: fsd_enel; Owner: fullscreen
--

ALTER TABLE ONLY "fsd_enel"."judet"
    ADD CONSTRAINT "judet_pkey" PRIMARY KEY ("id");


--
-- TOC entry 2101 (class 2606 OID 17487)
-- Name: localitate localitate_pkey; Type: CONSTRAINT; Schema: fsd_enel; Owner: fullscreen
--

ALTER TABLE ONLY "fsd_enel"."localitate"
    ADD CONSTRAINT "localitate_pkey" PRIMARY KEY ("id");


--
-- TOC entry 2128 (class 2606 OID 66701)
-- Name: passwords passwords_pkey; Type: CONSTRAINT; Schema: fsd_enel; Owner: fullscreen
--

ALTER TABLE ONLY "fsd_enel"."passwords"
    ADD CONSTRAINT "passwords_pkey" PRIMARY KEY ("id");


--
-- TOC entry 2103 (class 2606 OID 17489)
-- Name: segment segment_pkey; Type: CONSTRAINT; Schema: fsd_enel; Owner: fullscreen
--

ALTER TABLE ONLY "fsd_enel"."segment"
    ADD CONSTRAINT "segment_pkey" PRIMARY KEY ("id");


--
-- TOC entry 2105 (class 2606 OID 17491)
-- Name: service_offers service_offers_pkey; Type: CONSTRAINT; Schema: fsd_enel; Owner: fullscreen
--

ALTER TABLE ONLY "fsd_enel"."service_offers"
    ADD CONSTRAINT "service_offers_pkey" PRIMARY KEY ("id");


--
-- TOC entry 2107 (class 2606 OID 17493)
-- Name: session session_pkey; Type: CONSTRAINT; Schema: fsd_enel; Owner: fullscreen
--

ALTER TABLE ONLY "fsd_enel"."session"
    ADD CONSTRAINT "session_pkey" PRIMARY KEY ("id");


--
-- TOC entry 2109 (class 2606 OID 17495)
-- Name: strada strada_pkey; Type: CONSTRAINT; Schema: fsd_enel; Owner: fullscreen
--

ALTER TABLE ONLY "fsd_enel"."strada"
    ADD CONSTRAINT "strada_pkey" PRIMARY KEY ("id");


--
-- TOC entry 2111 (class 2606 OID 17497)
-- Name: tip_canal tip_canal_pkey; Type: CONSTRAINT; Schema: fsd_enel; Owner: fullscreen
--

ALTER TABLE ONLY "fsd_enel"."tip_canal"
    ADD CONSTRAINT "tip_canal_pkey" PRIMARY KEY ("id");


--
-- TOC entry 2113 (class 2606 OID 17499)
-- Name: tip_serviciu tip_serviciu_pkey; Type: CONSTRAINT; Schema: fsd_enel; Owner: fullscreen
--

ALTER TABLE ONLY "fsd_enel"."tip_serviciu"
    ADD CONSTRAINT "tip_serviciu_pkey" PRIMARY KEY ("id");


--
-- TOC entry 2125 (class 2606 OID 66693)
-- Name: tokens tokens_pkey; Type: CONSTRAINT; Schema: fsd_enel; Owner: fullscreen
--

ALTER TABLE ONLY "fsd_enel"."tokens"
    ADD CONSTRAINT "tokens_pkey" PRIMARY KEY ("id");


--
-- TOC entry 2120 (class 2606 OID 66680)
-- Name: users users_marca_key; Type: CONSTRAINT; Schema: fsd_enel; Owner: fullscreen
--

ALTER TABLE ONLY "fsd_enel"."users"
    ADD CONSTRAINT "users_marca_key" UNIQUE ("marca");


--
-- TOC entry 2122 (class 2606 OID 66678)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: fsd_enel; Owner: fullscreen
--

ALTER TABLE ONLY "fsd_enel"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");


--
-- TOC entry 2126 (class 1259 OID 66745)
-- Name: passwords_composite; Type: INDEX; Schema: fsd_enel; Owner: fullscreen
--

CREATE INDEX "passwords_composite" ON "fsd_enel"."passwords" USING "btree" ("userId", "createdAt");


--
-- TOC entry 2123 (class 1259 OID 66713)
-- Name: tokens_by_create_date; Type: INDEX; Schema: fsd_enel; Owner: fullscreen
--

CREATE INDEX "tokens_by_create_date" ON "fsd_enel"."tokens" USING "btree" ("createdAt" DESC);


--
-- TOC entry 2118 (class 1259 OID 66764)
-- Name: users_by_marca; Type: INDEX; Schema: fsd_enel; Owner: fullscreen
--

CREATE INDEX "users_by_marca" ON "fsd_enel"."users" USING "btree" ("marca");


--
-- TOC entry 2129 (class 2606 OID 42134)
-- Name: agent agent_companyId_fkey; Type: FK CONSTRAINT; Schema: fsd_enel; Owner: fullscreen
--

ALTER TABLE ONLY "fsd_enel"."agent"
    ADD CONSTRAINT "agent_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "fsd_enel"."company"("id") ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 2131 (class 2606 OID 66702)
-- Name: passwords passwords_userId_fkey; Type: FK CONSTRAINT; Schema: fsd_enel; Owner: fullscreen
--

ALTER TABLE ONLY "fsd_enel"."passwords"
    ADD CONSTRAINT "passwords_userId_fkey" FOREIGN KEY ("userId") REFERENCES "fsd_enel"."users"("id") ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 2130 (class 2606 OID 66681)
-- Name: users users_companyId_fkey; Type: FK CONSTRAINT; Schema: fsd_enel; Owner: fullscreen
--

ALTER TABLE ONLY "fsd_enel"."users"
    ADD CONSTRAINT "users_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "fsd_enel"."company"("id") ON UPDATE CASCADE ON DELETE SET NULL;


-- Completed on 2018-07-12 15:13:52 EEST

--
-- fullscreenQL database dump complete
--


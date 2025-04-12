import bbvaLogo from '../../../assets/bbva.png';
import banorteLogo from '../../../assets/banorte.png';
import santanderLogo from '../../../assets/santander.png';
import scotiabankLogo from '../../../assets/scotiabank.png';
import banamexLogo from '../../../assets/banamex.png';
import hsbcLogo from '../../../assets/hsbc.png';
import heyBancoLogo from '../../../assets/heybanco.svg';
import inbursaLogo from '../../../assets/inbursa.png';
import { IoBusinessOutline } from 'react-icons/io5';
import BanregioLogo from '../../../assets/banregio.png';

// Lista de bancos mexicanos con sus tasas de interés aproximadas
export const BANCOS = [
  { id: 1, nombre: 'BBVA', tasa: 12.5, cat: 16.2, comision: 2, logo: bbvaLogo },
  { id: 2, nombre: 'Banorte', tasa: 13.2, cat: 17.1, comision: 1.8, logo: banorteLogo },
  { id: 3, nombre: 'Santander', tasa: 13.8, cat: 17.5, comision: 2.2, logo: santanderLogo },
  { id: 4, nombre: 'Scotiabank', tasa: 14.2, cat: 18.3, comision: 1.5, logo: scotiabankLogo },
  { id: 5, nombre: 'Citibanamex', tasa: 13.5, cat: 17.8, comision: 2.0, logo: banamexLogo },
  { id: 6, nombre: 'HSBC', tasa: 14.5, cat: 18.9, comision: 1.7, logo: hsbcLogo },
  { id: 7, nombre: 'Inbursa', tasa: 12.8, cat: 16.5, comision: 1.9, logo: inbursaLogo },
  { id: 8, nombre: 'Afirme', tasa: 14.8, cat: 19.2, comision: 2.1, logo: IoBusinessOutline },
  { id: 9, nombre: 'BanRegio', tasa: 13.9, cat: 18.0, comision: 1.6, logo: BanregioLogo },
  { id: 10, nombre: 'Hey Banco', tasa: 12.9, cat: 16.8, comision: 1.8, logo: heyBancoLogo },
];

// Plazos disponibles para el crédito en meses
export const PLAZOS = [12, 24, 36, 48, 60];
export interface School {
  id: string;
  name: string;
  neighborhood: string;
  fullAddress: string;
  coordinates: [number, number]; // [longitude, latitude]
  email?: string;
  phone?: string;
  website?: string;
  nature: 'Pública' | 'Particular';
  additionalInfo?: string;
  contributor_name?: string;
  periods: string[];
  subjects: string[];
  shift: string[];
  instructors: {
    id: string;
    name: string;
    subject: string;
    shifts?: string[];
    periods?: string[];
    contributorName?: string;
    additionalInfo?: string;
  }[];
  formerStudents: {
    id: string;
    name: string;
    university: string;
    course: string;
    contributorName?: string;
    additionalInfo?: string;
  }[];
}

export const mockSchools: School[] = [];

export const neighborhoods = [
  'Paralela', 'Brotas', 'Barra', 'Itapuã', 'Liberdade', 'Ondina',
  'Campo Grande', 'Pituba', 'Rio Vermelho', 'Federação', 'Graça',
  'Vitória', 'Pelourinho', 'Comércio', 'Nazaré', 'Barris'
];

export const subjects = [
  'Pedagogia', 'História', 'Geografia', 'Português', 'Matemática',
  'Ciências', 'Inglês', 'Artes', 'Educação Física', 'Música',
  'Sociologia', 'Filosofia', 'Literatura', 'Química', 'Física'
];

export const periods = [
  'Educação Infantil',
  'Ensino Fundamental I',
  'Ensino Fundamental II',
  'Ensino Médio'
];

export const shifts = ['Matutino', 'Vespertino', 'Noturno', 'Integral'];

export const natures = ['Pública', 'Particular'];

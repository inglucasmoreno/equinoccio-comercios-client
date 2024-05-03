export interface ContribuyenteAfip {
  contribuyente: Contribuyente;
  success:       boolean;
  message:       string;
}

export interface Contribuyente {
  datosGenerales:      DatosGenerales;
  datosRegimenGeneral: DatosRegimenGeneral;
  errorMonotributo:    ErrorMonotributo;
  metadata:            Metadata;
}

export interface DatosGenerales {
  caracterizacion:     Caracterizacion[];
  domicilioFiscal:     DomicilioFiscal;
  esSucesion:          string;
  estadoClave:         string;
  fechaContratoSocial: Date;
  idPersona:           number;
  mesCierre:           number;
  razonSocial:         string;
  tipoClave:           string;
  tipoPersona:         string;
}

export interface Caracterizacion {
  descripcionCaracterizacion: string;
  idCaracterizacion:          number;
  periodo:                    number;
}

export interface DomicilioFiscal {
  codPostal:            string;
  descripcionProvincia: string;
  direccion:            string;
  idProvincia:          number;
  tipoDomicilio:        string;
}

export interface DatosRegimenGeneral {
  actividad: Actividad[];
  impuesto:  Impuesto[];
  regimen:   Regiman[];
}

export interface Actividad {
  descripcionActividad: string;
  idActividad:          number;
  nomenclador:          number;
  orden:                number;
  periodo:              number;
}

export interface Impuesto {
  descripcionImpuesto: string;
  idImpuesto:          number;
  periodo:             number;
}

export interface Regiman {
  descripcionRegimen?: string;
  idImpuesto:          number;
  idRegimen:           number;
  periodo:             number;
  tipoRegimen?:        TipoRegimen;
}

export enum TipoRegimen {
  Retencion = "RETENCION",
}

export interface ErrorMonotributo {
  error:   string[];
  mensaje: string;
}

export interface Metadata {
  fechaHora: Date;
  servidor:  string;
}

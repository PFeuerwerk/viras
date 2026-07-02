import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService, Usuario } from '../../../core/services/auth.service';
import { PlaceholderService } from '../../placeholder/services/placeholder.service';
import { Business } from '../../../core/models/business.model';
import { apiUrl } from '../../../core/api.config';

@Component({
  selector: 'app-anamnesis',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './anamnesis.component.html'
})
export class AnamnesisComponent implements OnInit {
  anamnesisForm!: FormGroup;
  isLoading = false;
  isSaving = false;
  successMessage = '';
  errorMessage = '';
  
  currentUser: Usuario | null = null;
  businessData: Business | undefined;

  // --- LISTADO DE PREGUNTAS (Para iteración en el Template) ---
  medicalQuestions = [
    { id: 'defectos_nacimiento', text: '¿Defectos de nacimiento o problemas hereditarios?' },
    { id: 'fracturas_oseas', text: '¿Fracturas óseas o lesiones graves?' },
    { id: 'lesiones_cara_cuello', text: '¿Alguna lesión en la cara, la cabeza o el cuello?' },
    { id: 'artritis_articulaciones', text: '¿Artritis o problemas articulares?' },
    { id: 'tiroides_endocrinos', text: '¿Problemas endocrinos o de tiroides?' },
    { id: 'diabetes_hipoglucemia', text: '¿Diabetes o hipoglucemia?' },
    { id: 'problemas_renales', text: '¿Problemas renales?' },
    { id: 'cancer_quimio', text: '¿Cáncer, tumor, radioterapia o quimioterapia?' },
    { id: 'ulcera_reflujo', text: '¿Úlcera estomacal, hiperacidez, reflujo ácido?' },
    { id: 'sistema_inmunitario', text: '¿Problemas del sistema inmunitario?' },
    { id: 'osteoporosis', text: '¿Antecedentes de osteoporosis?' },
    { id: 'ets', text: '¿Gonorrea, sífilis, herpes, enfermedades de transmisión sexual?' },
    { id: 'sida_vih', text: '¿SIDA o VIH positivo?' },
    { id: 'hepatitis_higado', text: '¿Hepatitis, ictericia u otros problemas hepáticos?' },
    { id: 'tuberculosis_neumonia', text: '¿Polionucleosis, mononucleosis, tuberculosis, neumonía?' },
    { id: 'convulsiones_neurologicos', text: '¿Convulsiones, desmayos, problemas neurológicos?' },
    { id: 'vision_audicion_habla', text: '¿Trastorno negativista desafiante? ¿Problemas de visión, audición o habla?' },
    { id: 'trastornos_alimentarios', text: '¿Antecedentes de trastornos alimentarios (anorexia, bulimia)?' },
    { id: 'presion_arterial', text: '¿Presión arterial alta o baja?' },
    { id: 'sangrado_anemia', text: '¿Sangrado o hematomas excesivos, anemia?' },
    { id: 'dificultad_respirar', text: '¿Dolor de pecho, dificultad para respirar, cansancio fácil, tobillos hinchados?' },
    { id: 'defectos_cardiacos', text: '¿Defectos cardíacos, soplo cardíaco, cardiopatía reumática?' },
    { id: 'angina_infarto', text: '¿Angina de pecho, arteriosclerosis, accidente cerebrovascular o infarto?' },
    { id: 'trastornos_cutaneos', text: '¿Algún trastorno cutáneo (aparte del acné común)?' },
    { id: 'dieta_equilibrada', text: '¿Sigue una dieta equilibrada?' },
    { id: 'migranas', text: '¿Sufre dolores de cabeza o migrañas frecuentes?' },
    { id: 'infecciones_oido_garganta', text: '¿Infecciones de oído, resfriados o infecciones de garganta frecuentes?' },
    { id: 'asma_sinusitis', text: '¿Asma, problemas de sinusitis, rinitis alérgica?' },
    { id: 'amigdalas_adenoides', text: '¿Amígdalas o adenoides?' },
    { id: 'respira_boca', text: '¿Respira frecuentemente por la boca?' }
  ];

  allergyQuestions = [
    { id: 'anestesicos_locales', text: 'Anestésicos locales (novocaína, lidocaína, xilocaína)' },
    { id: 'latex', text: 'Látex (guantes, globos)' },
    { id: 'aspirina', text: 'Aspirina' },
    { id: 'metales', text: 'Metales (joyas, broches de ropa)' },
    { id: 'penicilina', text: 'Penicilina' },
    { id: 'otros_antibioticos', text: 'Otros antibióticos' },
    { id: 'ibuprofeno', text: 'Ibuprofeno (Motrin, Advil)' },
    { id: 'acrilicos', text: 'Acrílicos' },
    { id: 'polen', text: 'Polen de plantas' },
    { id: 'animales', text: 'Animales' },
    { id: 'alimentos', text: 'Alimentos' },
    { id: 'otras_sustancias', text: 'Otras sustancias' }
  ];

  dentalQuestions = [
    { id: 'extraccion_dientes', text: '¿Le han extraído dientes permanentes o supernumerarios?' },
    { id: 'faltan_dientes', text: '¿Le faltan dientes supernumerarios o congénitamente?' },
    { id: 'dientes_lesionados', text: '¿Le han astillado o lesionado dientes primarios o permanentes?' },
    { id: 'dientes_sensibles', text: '¿Tiene algún diente sensible o dolorido?' },
    { id: 'sangrado_encias', text: '¿Le sangran las encías, tiene mal sabor o mal aliento?' },
    { id: 'fracturas_mandibula', text: '¿Le han realizado fracturas de mandíbula, quistes o infecciones?' },
    { id: 'tratamiento_conducto', text: '¿Le han realizado algún tratamiento de conducto o pulpotomía?' },
    { id: 'aftas_herpes', text: '¿Tiene abscesos gingivales, aftas o herpes labial con frecuencia?' },
    { id: 'problemas_habla', text: '¿Tiene antecedentes de problemas del habla o ha recibido terapia del habla?' },
    { id: 'respirar_nariz', text: '¿Le cuesta respirar por la nariz?' },
    { id: 'comida_entre_dientes', text: '¿Tiene restos de comida entre los dientes?' },
    { id: 'ronca_noche', text: '¿Respira por la boca o ronca por la noche?' },
    { id: 'habitos_orales', text: '¿Tiene hábitos orales frecuentes (chuparse el dedo, morder bolígrafos, etc.)?' },
    { id: 'irritacion_labios', text: '¿Le irritan los labios, las mejillas o las encías los dientes? ¿Dificultad para tragar (empuje lingual)?' },
    { id: 'rechina_dientes', text: '¿Rechina o aprieta los dientes?' },
    { id: 'chasquidos_mandibula', text: '¿Siente chasquidos o bloqueo en la mandíbula?' },
    { id: 'dolor_musculos_cara', text: '¿Dolor en los músculos de la mandíbula o la cara?' },
    { id: 'zumbido_masticar', text: '¿Tiene zumbido en los oídos, dificultad para masticar o abrir la mandíbula?' },
    { id: 'tratamiento_atm', text: '¿Ha recibido tratamiento para problemas de la ATM o del trastorno temporomandibular (TTM)?' },
    { id: 'empastes_rotos', text: '¿Tiene empastes rotos o faltantes?' },
    { id: 'problemas_previos_dentales', text: '¿Ha tenido algún problema grave relacionado con tratamientos dentales previos?' },
    { id: 'enfermedad_periodontal', text: '¿Le han diagnosticado alguna vez enfermedad periodontal o piorrea?' },
    { id: 'consulta_ortodoncia_previa', text: '¿Ha tenido alguna consulta o tratamiento de ortodoncia anteriormente?' }
  ];

  detailedQuestions = [
    { id: 'problemas_salud', text: '¿Tiene problemas de salud actualmente?' },
    { id: 'atencion_medica_actual', text: '¿Recibe atención médica actualmente?' },
    { id: 'hospitalizado', text: '¿Ha estado hospitalizado alguna vez?' },
    { id: 'sangrado_excesivo', text: '¿Padece de sangrado excesivo?' },
    { id: 'problemas_emocionales', text: '¿Ha tenido problemas emocionales?' },
    { id: 'reaccion_medicamentos', text: '¿Ha tenido reacción a medicamentos?' },
    { id: 'anestesia_local', text: '¿Ha tenido problemas con anestesia local?' },
    { id: 'experiencia_dental_mala', text: '¿Ha tenido malas experiencias dentales?' },
    { id: 'lesion_boca_dientes', text: '¿Ha tenido lesiones en boca o dientes?' },
    { id: 'dolor_dientes_mes', text: '¿Ha sentido dolor en dientes el último mes?' },
    { id: 'alergia_medicamento', text: '¿Alergia a algún medicamento?' },
    { id: 'alergia_alimento', text: '¿Alergia a algún alimento?' },
    { id: 'alergia_ambiental', text: '¿Alergia ambiental (polen, polvo)?' }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private http: HttpClient,
    private router: Router,
    private plService: PlaceholderService
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadBusinessData();
    this.initForm();
    this.loadExistingData();
  }

  private loadBusinessData(): void {
    const slug = this.currentUser?.slug || 'clinica-dental-pro';
    this.plService.loadInitialData(slug).subscribe(data => {
      this.businessData = data;
    });
  }

  private initForm(): void {
    this.anamnesisForm = this.fb.group({
      // 1. INFORMACIÓN GENERAL
      preocupacion_dental: [''],
      sugerencia_tratamiento: [''],
      cirugias_previas: [''],
      porque_eligio_clinica: [''],
      medicamentos_actuales: [''],
      tratamiento_previo_ortodoncia: [''],
      familiares_en_clinica: [''],
      actividades_afectan_mandibula: [''],
      embarazo_lactancia: [false],

      // 2. HISTORIAL MÉDICO (SI/NO/NS)
      historial_medico_json: this.fb.group(this.createControls(this.medicalQuestions)),
      
      // 3. ALERGIAS (SI/NO/NS)
      alergias_json: this.fb.group(this.createControls(this.allergyQuestions)),

      // 4. HISTORIAL DENTAL (SI/NO/NS)
      historial_dental_json: this.fb.group(this.createControls(this.dentalQuestions)),

      // 5. ANTECEDENTES FAMILIARES
      antecedentes_familiares_json: this.fb.group({
        trastornos_hemorragicos: [''],
        artritis: [''],
        problemas_dentales_inusuales: [''],
        otras_afecciones: ['']
      }),

      // 6. CUESTIONARIO DE SALUD DETALLADO (Existente)
      respuestas_evaluacion: this.fb.group({
        problemas_salud: this.createQuestionGroup(),
        atencion_medica_actual: this.createQuestionGroup(),
        hospitalizado: this.createQuestionGroup(),
        sangrado_excesivo: this.createQuestionGroup(),
        problemas_emocionales: this.createQuestionGroup(),
        reaccion_medicamentos: this.createQuestionGroup(),
        anestesia_local: this.createQuestionGroup(),
        experiencia_dental_mala: this.createQuestionGroup(),
        lesion_boca_dientes: this.createQuestionGroup(),
        dolor_dientes_mes: this.createQuestionGroup(),
        alergia_medicamento: this.createQuestionGroup(),
        alergia_alimento: this.createQuestionGroup(),
        alergia_ambiental: this.createQuestionGroup(),
      }),

      // 7. HÁBITOS Y OBSERVACIONES
      fuma: [false],
      frecuencia_fumar: [''],
      observaciones_adicionales: ['']
    });
  }

  private createControls(questions: any[]) {
    const controls: any = {};
    questions.forEach(q => {
      controls[q.id] = [null]; // null = No seleccionado todavía
    });
    return controls;
  }

  private createQuestionGroup() {
    return this.fb.group({
      respuesta: [null],
      explicacion: ['']
    });
  }

  private loadExistingData(): void {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    this.isLoading = true;
    this.http.get<any>(apiUrl(`/anamnesis/${user.id}`)).subscribe({
      next: (data) => {
        if (data) {
          // Si los datos JSON vienen del backend, se parchean automáticamente si coinciden los nombres
          this.anamnesisForm.patchValue(data);
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    this.isSaving = true;
    this.successMessage = '';
    this.errorMessage = '';

    const user = this.authService.getCurrentUser();
    const payload = {
      ...this.anamnesisForm.getRawValue(),
      paciente_id: user?.id
    };

    this.http.post(apiUrl('/anamnesis'), payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.successMessage = 'Expediente clínico actualizado correctamente.';
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => this.router.navigate(['/paciente/dashboard']), 3000);
      },
      error: (err) => {
        this.isSaving = false;
        this.errorMessage = err.error?.message || 'Error al guardar la información.';
      }
    });
  }

  printPage(): void {
    window.print();
  }

  goBack(): void {
    this.router.navigate(['/paciente/dashboard']);
  }
}

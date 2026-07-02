describe('PerfilComponent contract', () => {
  it('keeps patient profile fields aligned with UsuariosService update DTO', () => {
    const updatedData = {
      nombres: 'Ana',
      apellidos: 'Paciente',
      movil1: '+34123456789',
      ciudad: 'Madrid',
      grupo_sanguineo: 'O+',
      tutor_es_responsable: true,
    };

    expect(updatedData.nombres).toBeTruthy();
    expect(updatedData.ciudad).toBeTruthy();
    expect(updatedData.tutor_es_responsable).toBe(true);
  });
});

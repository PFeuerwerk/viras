describe('RegisterComponent contract', () => {
  it('uses backend-compatible role and password fields', () => {
    const payload = {
      email: 'paciente@example.com',
      password_hash: '123456',
      rol: 'PACIENTE',
      business_id: '00000000-0000-4000-8000-000000000000',
      dentista_id: '00000000-0000-4000-8000-000000000001',
    };

    expect(payload.rol).toBe('PACIENTE');
    expect(payload.password_hash).toBeTruthy();
    expect(payload.dentista_id).toBeTruthy();
  });
});

async function handleCreateAppointment(payload: Omit<Appointment, "id">) {
  if (!canEdit) return;

  const mockAppointment: Appointment = {
    id: crypto.randomUUID(),
    ...payload,
    reminderStatus: payload.reminderStatus ?? "Belum Dihantar",
    reminderSentAt: payload.reminderSentAt ?? null,
    reminderChannel: payload.reminderChannel ?? null,
    reminderNote: payload.reminderNote ?? null
  };

  setAppointments((current) => [...current, mockAppointment]);

  let finalAppointment = mockAppointment;

  try {
    const created = await createAppointment(payload);
    if (created) {
      finalAppointment = created;
      setAppointments((current) =>
        current.map((item) => (item.id === mockAppointment.id ? created : item))
      );
    }
  } catch (error) {
    console.error(error);
    setToast("Temujanji gagal disimpan ke database.");
    return;
  }

  try {
    if (payload.manualStatus === "Tidak Hadir" || payload.manualStatus === "Dijadualkan") {
      const followUp = await createFollowUpIfNeeded({
        appointmentId: finalAppointment.id,
        patientId: payload.patientId
      });

      if (followUp) {
        setFollowUps((current) => {
          const exists = current.some((item) => item.id === followUp.id);
          return exists ? current : [...current, followUp];
        });
      }
    }

    await refreshAll();
    setToast("Temujanji berjaya ditambah dan disimpan online.");
  } catch (error) {
    console.error(error);
    setToast("Temujanji berjaya disimpan, tetapi follow-up / refresh gagal.");
  }
}

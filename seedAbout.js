async function run() {
  const loginRes = await fetch("http://localhost:5000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "admin", password: "Kerem2026Admin!SecurePass" })
  });
  const { token } = await loginRes.json();
  
  if (!token) {
    console.error("Login failed");
    return;
  }

  const payload = {
    terminal_title: "kerem@portfolio ~ $ cat about.txt",
    p1_1: "Merhaba! Ben ",
    p1_2: "Kerem Düz",
    p1_3: ", Bilgisayar Mühendisliği öğrencisi ve siber güvenlik tutkunu.",
    p2: "Kod satırları arasında güvenlik açıkları ararken, boş zamanlarında dünyayı keşfetmeyi, farklı kültürleri deneyimlemeyi ve anı biriktirmeyi seviyorum. Her yeni şehir bana farklı bir bakış açısı kazandırıyor.",
    p3: "Savunma odaklı siber güvenlik, ağ güvenliği, penetrasyon testi ve zararlı yazılım analizi alanlarında kendimi geliştiriyorum. Amacım dijital dünyayı daha güvenli bir yer yapmak.",
    focusLabel: "ODAK ALANI",
    focusValue: "Siber Güvenlik & Yazılım",
    expertiseLabel: "UZMANLIK",
    expertiseValue: "Network Security, Pentest",
    locationLabel: "KONUM",
    locationValue: "Ankara & Antalya, Türkiye",
    fuelLabel: "YAKIT",
    fuelValue: "Kahve & Merak"
  };

  const updateRes = await fetch("http://localhost:5000/api/about/admin", {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  
  console.log("Status:", updateRes.status);
}
run();

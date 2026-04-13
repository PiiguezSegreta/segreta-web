#!/bin/bash
# Script para copiar y renombrar imágenes desde el build de Lovable
# Ejecutar desde la raíz del proyecto: bash copy-assets.sh

SRC="../../references/recursos-piezas/segreta-recursos/Web Segreta 1.0/segreta-static-site/assets"
DEST="./assets/img"

echo "Copiando imágenes desde el build de Lovable..."

# Logos e identidad
cp "$SRC/segreta-logo-Bz77ei4r.png"        "$DEST/segreta-logo.png"
cp "$SRC/segreta-isotipo-sp359O3I.png"     "$DEST/segreta-isotipo.png"

# Hero y secciones principales
cp "$SRC/hero-restaurant-BrIg4lgO.jpg"     "$DEST/hero-restaurant.jpg"
cp "$SRC/nosotros-hero-pizza-BYocRAVs.jpg" "$DEST/nosotros-hero.jpg"
cp "$SRC/events-hero-Dmx7HaBV.jpg"         "$DEST/events-hero.jpg"
cp "$SRC/segreta-partners-hero-new-BRwkPxOT.jpg" "$DEST/partners-hero.jpg"

# Especialidades (home)
cp "$SRC/pizza-napolitana-new-cPeWNmku.jpg" "$DEST/pizza-napolitana.jpg"
cp "$SRC/cocktail-autor-DAjIYEnK.jpg"       "$DEST/cocktail-autor.jpg"
cp "$SRC/ambiente-unico-CMfWozv5.jpg"       "$DEST/ambiente-unico.jpg"

# Nosotros
cp "$SRC/oven-Dwl3WNdi.jpg"               "$DEST/oven.jpg"
cp "$SRC/pizzero-trabaja-CsuPPkjN.jpg"    "$DEST/pizzero.jpg"
cp "$SRC/team-uniforme-wrUtCdqj.jpg"      "$DEST/team-uniforme.jpg"

# Galería (experiencias)
cp "$SRC/gallery-barman-3-rdcfITQ3.jpg"        "$DEST/gallery-barman.jpg"
cp "$SRC/gallery-barman-vitacura-2-Dc9o09vr.jpg" "$DEST/gallery-barman-vitacura.jpg"
cp "$SRC/gallery-dsc-0269-Cni8I4Dy.jpg"        "$DEST/gallery-dsc-0269.jpg"
cp "$SRC/gallery-lleno-2-DULDou8a.png"          "$DEST/gallery-lleno.png"
cp "$SRC/gallery-mistral-segreta-2-C5ehFmtq.jpg" "$DEST/gallery-mistral.jpg"
cp "$SRC/gallery-musica-vivo-2-DItkNXWv.jpg"    "$DEST/gallery-musica.jpg"
cp "$SRC/gallery-noche-lleno-3-C8ET2tsi.png"    "$DEST/gallery-noche-lleno.png"
cp "$SRC/gallery-ph-12-3-BRqRtYIe.jpg"          "$DEST/gallery-ph-12.jpg"
cp "$SRC/gallery-pizza-burrata-3-C1y346L7.jpg"  "$DEST/gallery-pizza-burrata.jpg"
cp "$SRC/gallery-postre-2-6mxHMSkW.jpg"         "$DEST/gallery-postre.jpg"
cp "$SRC/gallery-segundo-piso-SKV4iP2A.jpg"     "$DEST/gallery-segundo-piso.jpg"

# Activaciones
cp "$SRC/martes-para-ellas-DssoaLA_.jpg"  "$DEST/martes-para-ellas.jpg"
cp "$SRC/sunday-sangria-DZAzT5Pq.jpg"     "$DEST/sunday-sangria.jpg"
cp "$SRC/tardes-verano-kRh_dzbS.jpg"      "$DEST/tardes-verano.jpg"
cp "$SRC/viernes-schop-CYQNi6AR.jpg"      "$DEST/viernes-schop.jpg"
cp "$SRC/segreta-activacion-BmmEmBMk.jpg" "$DEST/segreta-activacion.jpg"

# Eventos
cp "$SRC/evento-segreta-2-CjEVrq99.jpg"  "$DEST/evento-segreta.jpg"
cp "$SRC/eventos-fuera-B_BH2O14.jpg"     "$DEST/eventos-fuera.jpg"
cp "$SRC/segreta-eventos-3-CbxmkP8M.jpg" "$DEST/segreta-eventos.jpg"
cp "$SRC/segreta-2do-piso-C6JV8a_I.jpg"  "$DEST/segreta-2do-piso.jpg"

# Ambientes
cp "$SRC/segreta-bar--bHXp7wx.jpg"          "$DEST/segreta-bar.jpg"
cp "$SRC/segreta-gente-noche-C4aQ78Ac.png"  "$DEST/segreta-gente-noche.png"
cp "$SRC/segreta-noche-lleno-2-D49HPeJn.png" "$DEST/segreta-noche-lleno.png"
cp "$SRC/comida-segreta-V5PtXb3d.jpg"       "$DEST/comida-segreta.jpg"
cp "$SRC/en-segreta-B0EEpfC9.jpg"           "$DEST/en-segreta.jpg"
cp "$SRC/camera-segreta-DnkNHm0E.jpg"       "$DEST/camera-segreta.jpg"
cp "$SRC/carrito-segreta-jHATmRs9.jpg"      "$DEST/carrito-segreta.jpg"

# Logos de partners (marcas)
cp "$SRC/logo-mistral-new-DblMvzeg.png"          "$DEST/logo-mistral.png"
cp "$SRC/logo-johnnie-walker-new-DNgfmsab.png"   "$DEST/logo-johnnie-walker.png"
cp "$SRC/logo-royal-new-DVKDU4jM.png"            "$DEST/logo-royal.png"
cp "$SRC/logo-tanqueray-new-ImNxnCvF.png"        "$DEST/logo-tanqueray.png"
cp "$SRC/logo-cocacola-new-DRftby8S.png"         "$DEST/logo-cocacola.png"
cp "$SRC/logo-santa-rita-BDRONfxu.png"           "$DEST/logo-santa-rita.png"
cp "$SRC/logo-espiritu-andes-new-CDhofrYU.png"   "$DEST/logo-espiritu-andes.png"
cp "$SRC/logo-redbull-new-DCv66ox-.png"          "$DEST/logo-redbull.png"
cp "$SRC/logo-don-julio-DsC6SwfE.png"            "$DEST/logo-don-julio.png"
cp "$SRC/logo-austral-DAKRcuX3.png"              "$DEST/logo-austral.png"
cp "$SRC/logo-aperol-new-CZwpJQlo.png"           "$DEST/logo-aperol.png"
cp "$SRC/logo-loa-new-e85DRVzL.png"              "$DEST/logo-loa.png"
cp "$SRC/logo-licor43-Dq_01OYQ.png"              "$DEST/logo-licor43.png"
cp "$SRC/logo-ramazzotti-new-BIPbZHt3.png"       "$DEST/logo-ramazzotti.png"
cp "$SRC/logo-schweppes-new-Cr-GSIr5.png"        "$DEST/logo-schweppes.png"
cp "$SRC/logo-andina-DuRZFGK4.png"               "$DEST/logo-andina.png"
cp "$SRC/logo-ccu-jXOe0mBd.png"                  "$DEST/logo-ccu.png"
cp "$SRC/logo-pisquera-chile-r3EMlt6x.png"       "$DEST/logo-pisquera-chile.png"
cp "$SRC/logo-diageo-CcF3oBi1.png"               "$DEST/logo-diageo.png"

echo "Listo. Imágenes copiadas en $DEST"

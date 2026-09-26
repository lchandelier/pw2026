<?php
declare(strict_types=1);
require __DIR__ . '/lib.php';

$https = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
session_name('raccourcisseur_admin');
session_set_cookie_params([
    'lifetime' => 0,
    'path' => rtrim(dirname($_SERVER['SCRIPT_NAME']), '/') . '/',
    'secure' => $https,
    'httponly' => true,
    'samesite' => 'Strict',
]);
session_start();

header('Content-Type: text/html; charset=utf-8');
header("Content-Security-Policy: default-src 'none'; img-src 'self'; style-src 'self'; script-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'");
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: no-referrer');
header('X-Robots-Tag: noindex, nofollow');

$_SESSION['csrf'] ??= bin2hex(random_bytes(32));

function flash(string $type, string $message): void
{
    $_SESSION['flash'] = ['type' => $type, 'message' => $message];
}

function back(): never
{
    header('Location: ' . strtok($_SERVER['REQUEST_URI'], '?'), true, 303);
    exit;
}

$hash = (string) config()['admin_password_hash'];
$loggedIn = !empty($_SESSION['auth']);
$generatedHash = null;
$old = $_SESSION['old'] ?? ['url' => '', 'slug' => ''];
unset($_SESSION['old']);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!hash_equals($_SESSION['csrf'], (string) ($_POST['csrf'] ?? ''))) {
        flash('erreur', 'La session a expiré. Recommencez l’opération.');
        back();
    }
    $action = (string) ($_POST['action'] ?? '');

    if ($action === 'generer' && $hash === '') {
        $pwd = (string) ($_POST['mot_de_passe'] ?? '');
        if (strlen($pwd) < 12) {
            flash('erreur', 'Le mot de passe doit contenir au moins 12 caractères.');
            back();
        }
        $generatedHash = password_hash($pwd, PASSWORD_DEFAULT);
    } elseif ($action === 'connexion' && $hash !== '') {
        if (password_verify((string) ($_POST['mot_de_passe'] ?? ''), $hash)) {
            session_regenerate_id(true);
            $_SESSION['auth'] = true;
        } else {
            sleep(2); // ralentit les tentatives répétées
            flash('erreur', 'Mot de passe incorrect.');
        }
        back();
    } elseif ($loggedIn && $action === 'deconnexion') {
        $_SESSION = [];
        session_destroy();
        back();
    } elseif ($loggedIn && $action === 'creer') {
        $url = trim((string) ($_POST['url'] ?? ''));
        $slug = trim((string) ($_POST['slug'] ?? ''));
        $_SESSION['old'] = ['url' => $url, 'slug' => $slug];

        if (!is_valid_url($url)) {
            flash('erreur', 'L’adresse de destination doit commencer par https:// ou http://.');
            back();
        }
        if ($slug !== '' && !is_valid_slug($slug)) {
            flash('erreur', 'Le lien court ne peut contenir que des lettres sans accent, des chiffres, des tirets et des tirets bas. Les noms admin, index, lib, config, data et assets sont réservés.');
            back();
        }
        $pdo = db();
        $insert = $pdo->prepare('INSERT INTO liens (slug, url, cree_le) VALUES (?, ?, ?)');
        $tries = 0;
        do {
            $candidate = $slug !== '' ? $slug : random_slug();
            try {
                $insert->execute([$candidate, $url, date('Y-m-d')]);
                unset($_SESSION['old']);
                flash('succes', 'Lien créé : ' . base_url() . '/' . $candidate);
                back();
            } catch (PDOException $ex) {
                if ($slug !== '') {
                    flash('erreur', 'Le lien court « ' . $slug . ' » existe déjà. Choisissez-en un autre.');
                    back();
                }
            }
        } while (++$tries < 10);
        flash('erreur', 'Impossible de générer un lien court libre. Réessayez.');
        back();
    } elseif ($loggedIn && $action === 'modifier') {
        $slug = (string) ($_POST['slug'] ?? '');
        $url = trim((string) ($_POST['url'] ?? ''));
        if (!is_valid_url($url)) {
            flash('erreur', 'Destination non modifiée : l’adresse doit commencer par https:// ou http://.');
            back();
        }
        db()->prepare('UPDATE liens SET url = ? WHERE slug = ?')->execute([$url, $slug]);
        flash('succes', 'Destination de /' . $slug . ' modifiée.');
        back();
    } elseif ($loggedIn && $action === 'supprimer') {
        $slug = (string) ($_POST['slug'] ?? '');
        db()->prepare('DELETE FROM liens WHERE slug = ?')->execute([$slug]);
        flash('succes', 'Lien /' . $slug . ' supprimé.');
        back();
    } else {
        back();
    }
}

$flash = $_SESSION['flash'] ?? null;
unset($_SESSION['flash']);
$links = $loggedIn ? db()->query('SELECT * FROM liens ORDER BY cree_le DESC, slug')->fetchAll() : [];
$base = base_url();
$csrf = e($_SESSION['csrf']);
?>
<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title><?= $loggedIn ? 'Liens courts' : 'Connexion' ?> – Raccourcisseur</title>
<link rel="stylesheet" href="assets/admin.css?v=<?= filemtime(__DIR__ . '/assets/admin.css') ?>">
<script src="assets/admin.js?v=<?= filemtime(__DIR__ . '/assets/admin.js') ?>" defer></script>
</head>
<body>
<div class="page">
<header>
  <h1>Raccourcisseur</h1>
  <?php if ($loggedIn): ?>
    <form method="post">
      <input type="hidden" name="csrf" value="<?= $csrf ?>">
      <button class="secondaire" name="action" value="deconnexion">Se déconnecter</button>
    </form>
  <?php endif; ?>
</header>
<main>
<?php if ($flash): ?>
  <p class="message <?= e($flash['type']) ?>" role="<?= $flash['type'] === 'erreur' ? 'alert' : 'status' ?>" tabindex="-1" id="message"><?= e($flash['message']) ?></p>
<?php endif; ?>

<?php if ($hash === ''): ?>
  <div class="etroit">
    <h2>Première configuration</h2>
    <?php if ($generatedHash): ?>
      <p>Copiez cette empreinte dans <code>config.php</code>, à la ligne <code>admin_password_hash</code>, puis rechargez cette page :</p>
      <p><code><?= e($generatedHash) ?></code></p>
      <p>Le mot de passe lui-même n’est enregistré nulle part.</p>
    <?php else: ?>
      <p>Aucun mot de passe n’est configuré. Choisissez-en un pour générer son empreinte.</p>
      <form method="post">
        <input type="hidden" name="csrf" value="<?= $csrf ?>">
        <div class="champ">
          <label for="mdp">Mot de passe</label>
          <span class="aide" id="mdp-aide">12 caractères minimum.</span>
          <input type="password" id="mdp" name="mot_de_passe" autocomplete="new-password" minlength="12" required aria-describedby="mdp-aide">
        </div>
        <button name="action" value="generer">Générer l’empreinte</button>
      </form>
    <?php endif; ?>
  </div>

<?php elseif (!$loggedIn): ?>
  <div class="etroit">
    <h2>Connexion</h2>
    <form method="post">
      <input type="hidden" name="csrf" value="<?= $csrf ?>">
      <input type="text" name="username" value="admin" autocomplete="username" hidden>
      <div class="champ">
        <label for="mdp">Mot de passe</label>
        <input type="password" id="mdp" name="mot_de_passe" autocomplete="current-password" required>
      </div>
      <button name="action" value="connexion">Se connecter</button>
    </form>
  </div>

<?php else: ?>
  <section class="creation" aria-labelledby="titre-creation">
    <h2 id="titre-creation">Créer un lien court</h2>
    <form method="post">
      <input type="hidden" name="csrf" value="<?= $csrf ?>">
      <div class="ligne">
        <div class="champ">
          <label for="url">Adresse de destination</label>
          <span class="aide" id="url-aide">L’adresse complète, par exemple https://example.com/talks/transcript</span>
          <input type="url" id="url" name="url" required value="<?= e($old['url']) ?>" aria-describedby="url-aide">
        </div>
        <div class="champ">
          <label for="slug">Lien court (facultatif)</label>
          <span class="aide" id="slug-aide">Lettres sans accent, chiffres, - et _. Laissez vide pour un code aléatoire.</span>
          <div class="prefixe">
            <span aria-hidden="true"><?= e(preg_replace('#^https?://#', '', $base)) ?>/</span>
            <input type="text" id="slug" name="slug" value="<?= e($old['slug']) ?>" pattern="[A-Za-z0-9_\-]{1,64}" maxlength="64" autocapitalize="off" spellcheck="false" aria-describedby="slug-aide">
          </div>
        </div>
      </div>
      <button name="action" value="creer">Créer le lien</button>
    </form>
  </section>

  <h2 id="titre-liens">Liens existants</h2>
  <?php if (!$links): ?>
    <p class="vide">Aucun lien pour l’instant. Créez le premier avec le formulaire ci-dessus.</p>
  <?php else: ?>
    <div class="tableau">
    <table aria-labelledby="titre-liens">
      <caption><?= count($links) ?> lien<?= count($links) > 1 ? 's' : '' ?>. Les clics sont un simple total, sans aucune donnée sur les visiteurs.</caption>
      <thead>
        <tr>
          <th scope="col">Lien court</th>
          <th scope="col">Destination</th>
          <th scope="col" class="nombre">Clics</th>
          <th scope="col">Créé le</th>
          <th scope="col">Actions</th>
        </tr>
      </thead>
      <tbody>
      <?php foreach ($links as $l): $short = $base . '/' . $l['slug']; ?>
        <tr>
          <th scope="row" class="court"><?= e($l['slug']) ?></th>
          <td class="destination">
            <a href="<?= e($l['url']) ?>" rel="noreferrer"><?= e($l['url']) ?></a>
            <details>
              <summary>Modifier la destination<span class="visuellement-cache"> de <?= e($l['slug']) ?></span></summary>
              <form method="post">
                <input type="hidden" name="csrf" value="<?= $csrf ?>">
                <input type="hidden" name="slug" value="<?= e($l['slug']) ?>">
                <label class="visuellement-cache" for="dest-<?= e($l['slug']) ?>">Nouvelle destination de <?= e($l['slug']) ?></label>
                <input type="url" id="dest-<?= e($l['slug']) ?>" name="url" value="<?= e($l['url']) ?>" required>
                <button name="action" value="modifier">Enregistrer</button>
              </form>
            </details>
          </td>
          <td class="nombre"><?= (int) $l['clics'] ?></td>
          <td><time datetime="<?= e($l['cree_le']) ?>"><?= e(date('d/m/Y', strtotime($l['cree_le']))) ?></time></td>
          <td>
            <div class="actions">
              <button type="button" class="secondaire copier" data-url="<?= e($short) ?>" hidden>Copier<span class="visuellement-cache"> le lien <?= e($l['slug']) ?></span></button>
              <form method="post" class="suppression" data-slug="<?= e($l['slug']) ?>">
                <input type="hidden" name="csrf" value="<?= $csrf ?>">
                <input type="hidden" name="slug" value="<?= e($l['slug']) ?>">
                <button class="danger" name="action" value="supprimer">Supprimer<span class="visuellement-cache"> le lien <?= e($l['slug']) ?></span></button>
              </form>
            </div>
          </td>
        </tr>
      <?php endforeach; ?>
      </tbody>
    </table>
    </div>
  <?php endif; ?>
  <p role="status" class="visuellement-cache" id="annonce"></p>
<?php endif; ?>
</main>
</div>
</body>
</html>

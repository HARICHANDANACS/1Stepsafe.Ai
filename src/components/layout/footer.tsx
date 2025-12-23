export function Footer() {
  return (
    <footer className="border-t">
      <div className="container py-8 text-center text-sm text-muted-foreground">
        <p className="mb-2">
          Informational guidance only. Not a substitute for professional medical advice or official weather warnings.
        </p>
        <p>&copy; {new Date().getFullYear()} StepSafe AI. All Rights Reserved.</p>
      </div>
    </footer>
  );
}

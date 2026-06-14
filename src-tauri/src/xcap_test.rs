pub fn test() {
    let monitors = xcap::Monitor::all().unwrap();
    let monitor = &monitors[0];
    let image = monitor.capture_image().unwrap();
    
    // Check if the image is all black
    let is_all_black = image.pixels().all(|p| p[0] == 0 && p[1] == 0 && p[2] == 0);
    println!("Captured: {}x{}, Is all black: {}", image.width(), image.height(), is_all_black);
}

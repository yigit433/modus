use std::time::Instant;

fn main() {
    let start = Instant::now();
    let monitors = xcap::Monitor::all().unwrap();
    let m = &monitors[0];
    let _img = m.capture_image().unwrap();
    println!("xcap capture took: {:?}", start.elapsed());

    #[cfg(target_os = "macos")]
    {
        use core_graphics::display::{CGDisplay, CGRect, CGPoint, CGSize};
        let start2 = Instant::now();
        let display = CGDisplay::main();
        let rect = CGRect::new(&CGPoint::new(0.0, 0.0), &CGSize::new(200.0, 200.0));
        let img2 = display.image_for_rect(rect).unwrap();
        println!("CGDisplay rect capture took: {:?}", start2.elapsed());
    }
}

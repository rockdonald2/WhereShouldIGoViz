in = beadando.md
out = Lukacs_Zsolt_HovaTovabb_HogyanKeszult.pdf

makepdf: $(in)
	pandoc $(in) -o $(out)

clean: $(out)
	rm -i $(out)